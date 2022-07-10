type token_id is nat

// nat(=token id) --> address(=user) --> nat(=balance)
type balance is map(token_id, map(address, nat))

// nat(=token id) --> string(=link to ipfs)
type uris is map(token_id, string)

// address(=holder) -->  address(=operator) --> nat(=id nft) --> bool(=allow/deny)
type operator_approvals is map(address, map(address, map(nat, bool)))

type metadata is record [
    uri: string;
    name: string;
    symbol: string;
]

type database_id is nat

type addFile_params is record [
    data : string;
    token_id : token_id;
    database_id: database_id;
]

type transfer_from_params is record [
    _from: address;
    _to: address;
    token_id: nat;
]

type listed_sale is record [
    price: tez;
    nft_id: token_id;
    to_pay: address;
    active: bool;
]

type listed_sale_params is record [
    listed_sale: listed_sale;
    transfer_params: transfer_from_params;
]

type token_metadata is map(token_id, metadata);

type storage is record [
    balance: balance;
    operator_approvals: operator_approvals;
    uris: uris;
    counter: nat;
    salesCounter: nat;
    token_metadata : token_metadata;
    whitelist: set(address);
    owner: address;
    sales: map(token_id, listed_sale);
    files : map(token_id, map(database_id, string));
]

type token_metadata is map(token_id, map(string, bytes))

type set_approval_params is record [
    operator: address;
    token_id: token_id;
]
[@layout:comb]
const noOperations : list (operation) = nil;

type return is list(operation) * storage;


(* Simply returns the counter *)
[@view] function getCounter (const _ : unit; const s: storage) : nat is s.counter

(* Returns a bool as true if the given address is owner of the NFT *)
[@view] function isOwner (const params : set_approval_params; const s : storage) : bool is 
    block {
         var balances : map(address, nat) := case Map.find_opt(params.token_id, s.balance) of [
        | Some (bal) -> bal
        | None -> failwith("This NFT does not exists")
        ];

        var user_balance : nat := case Map.find_opt(Tezos.sender, balances) of [
        | Some (bal) -> bal
        | None -> failwith("You don't own the NFT")
        ]; 

        var isOwner := False ;

        if user_balance = 1n 
        then isOwner := True
        
    } with (isOwner)

(* Returns a boolean if the operator is approved *)
[@view] function isApprovedForAll (const params : set_approval_params; const s : storage) : bool is 
    block {
        
        // We unpack one by one each nested map
        var operator_rights : map(address, map(nat, bool)) := case Map.find_opt(Tezos.sender, s.operator_approvals) of [
        | Some (rights) -> rights
        | None -> failwith("There's no rights on this NFT")
        ];

        var list_rights : map(nat, bool) := case Map.find_opt(params.operator, operator_rights) of [
            | Some(right) -> right
            | None -> failwith("You do not have rights")
        ];

        var get_right : bool := case Map.find_opt(params.token_id, list_rights) of [
            | Some(right) -> right
        | None -> failwith("Non-existing rights")
        ];
        
    }with (get_right)

function addWhitelist(const operator : address; var s: storage) : return is 
block {
    // On s'assure qu'il n'y ait pas un probleme au niveau de l'avancer de l'ID
     if Tezos.sender = s.owner then skip else failwith("You can't use this function");
     const whitelisted : set(address) = Set.add(operator, s.whitelist);
     s.whitelist := whitelisted

 } with (noOperations, s)

function addFile(const params : addFile_params; var s : storage) : return is 
block {
    if Set.mem (Tezos.sender, s.whitelist) then skip else failwith("You can't do this");
    // const map_files = case Map.find_opt(addFile_params.token_id, s.files) of [
    //     | Some (files) -> failwith("File already exist")
    //     | None -> skip
    // ];

    const nested_map :map(database_id, string) = map [
        params.database_id -> params.data
    ];
    const new_files = Map.add(params.token_id, nested_map, s.files);
    s.files := new_files;
}with (noOperations, s)

(* Update the storage at the given ID by the counter (1=owned) *)
function mint(const metadata : metadata; var s: storage) : return is 
block {
    // On s'assure qu'il n'y ait pas un probleme au niveau de l'avancer de l'ID
    if Map.mem(s.counter, s.balance) 
    then failwith("ID already used")
    else skip;

    // On créer un mapping qui représente le NFT et son propriétaire
    const nft : map(address, nat) = map [
         Tezos.sender -> 1n
    ];
    
    // const meta : metadata = record [
    //     uri = metadata.uri;
    //     name = metadata.name;
    //     symbol = metadata.symbol;
    // ];

    const new_metadata = Map.add(s.counter, metadata, s.token_metadata);
    s.token_metadata := new_metadata;
    s.balance[s.counter] := nft;
    s.counter := s.counter + 1n;
     

 } with (noOperations, s)

(* Permet de supprimer un token dont on est owner *)
function burn(const id : token_id; var s: storage) : return is 
block {

    // on initialise la variable pour la fonction isOwner
    var params : set_approval_params := record[
        operator = Tezos.sender;
        token_id = id
    ];

    // Rétourne l'adresse est bien owner
    var is_owner := isOwner(params, s);

    // On récupère le ledger pour pouvoir le modifier ensuite
    var balances : map(address, nat) := case Map.find_opt(params.token_id, s.balance) of [
        | Some (bal) -> bal
        | None -> failwith("This NFT does not exists")
    ];

    // On met le résultat de l'update de `balances` dans `updated_balance_map`
    var updated_balance_map : map(address, nat) := if is_owner
    then Map.update(Tezos.sender, Some(0n), balances) 
    else failwith("Don't burn an unexisting token");

    // Enfin on met à jour le storage pour réellement mettre à jour la data du smart contract
    s.balance[id] := updated_balance_map;
    
} with (noOperations, s)

function setApprovalForAll(const params : set_approval_params; var s: storage) : return is 
block{
    // Vérifie que le sender et l'operator sont bien différents
    if Tezos.source =/= params.operator then skip else failwith("You shouldn't approve your self");
    
    // Rétourne l'adresse est bien owner
    var is_owner := isOwner(params, s);
        
    if is_owner = True then skip else failwith("Not owner");

    const nested_map : map(nat, bool) = map [
        params.token_id -> True
    ];

    const operator : map(address, map(nat, bool)) = map [
         params.operator -> nested_map
     ];
     
    const added_item = Map.add(Tezos.sender, operator, s.operator_approvals);
    s.operator_approvals := added_item

    
} with (noOperations, s)

(* Permet de transferer un token à une autre adresse ou à transfer un token où nous sommes approuvés *)
function transferFrom(const params : transfer_from_params; var s : storage) : return is 
block{

    const approval_params = record[
        operator = params._from;
        token_id = params.token_id;
    ];
    
    (* REGARDE LES PARAMETRES DE isApprovedForAll*)
    
    if isOwner(approval_params, s) 
    then skip 
    else if isApprovedForAll(approval_params, s) 
    then skip 
    else failwith("You can't send this NFT");

    // On récupère le ledger pour pouvoir le modifier ensuite
    var balances : map(address, nat) := case Map.find_opt(params.token_id, s.balance) of [
    | Some (bal) -> bal
    | None -> failwith("You're trying to be send an unexisting NFT")
    ];

     // On récupère la balance du user concerné
     var user_balance : nat := case Map.find_opt(params._from, balances) of [
    | Some (bal) -> bal
    | None -> failwith("You don't own the NFT")
    ]; 

    // Met à 0 la balance de l'expéditeur
    var updated_balance_map : map(address, nat) := if user_balance = 1n 
    then 
    Map.update(params._from, Some(0n), balances)
    else failwith("You don't own the NFT II");

    // Met à 1 la balance du receveur
    var updated_balance_map2 : map(address, nat) := if user_balance = 1n 
    then 
    Map.update(params._to, Some(1n), updated_balance_map)
    else failwith("You don't own the NFT III");

    // Met à jour le storage du smart-contract
    s.balance[params.token_id] := updated_balance_map2;

} with (noOperations, s)

function createSale(const sale : listed_sale_params; var s : storage) : return is block {
   
    const new_sales = Map.add(s.salesCounter, sale.listed_sale, s.sales);

    const approval_params = record[
        operator = sale.transfer_params._from;
        token_id = sale.transfer_params.token_id;
    ];
    
    (* REGARDE LES PARAMETRES DE isApprovedForAll*)
    
    if isOwner(approval_params, s) 
    then skip 
    else if isApprovedForAll(approval_params, s) 
    then skip 
    else failwith("You can't send this NFT");

    // On récupère le ledger pour pouvoir le modifier ensuite
    var balances : map(address, nat) := case Map.find_opt(sale.transfer_params.token_id, s.balance) of [
    | Some (bal) -> bal
    | None -> failwith("You're trying to be send an unexisting NFT")
    ];

     // On récupère la balance du user concerné
     var user_balance : nat := case Map.find_opt(sale.transfer_params._from, balances) of [
    | Some (bal) -> bal
    | None -> failwith("You don't own the NFT")
    ]; 

    // Met à 0 la balance de l'expéditeur
    var updated_balance_map : map(address, nat) := if user_balance = 1n 
    then 
    Map.update(sale.transfer_params._from, Some(0n), balances)
    else failwith("You don't own the NFT II");

    // Met à 1 la balance du receveur
    var updated_balance_map2 : map(address, nat) := if user_balance = 1n 
    then 
    Map.update(Tezos.self_address, Some(1n), updated_balance_map)
    else failwith("You don't own the NFT III");

    // Met à jour le storage du smart-contract
    s.balance[sale.transfer_params.token_id] := updated_balance_map2;

    s.counter := s.counter + 1n;
    s.salesCounter := s.salesCounter + 1n;
    s.sales := new_sales;
}with(noOperations, s)

function buySale(const id : nat; var s : storage) : return is block {

    var sale := case Map.find_opt(id, s.sales) of [
        | Some(sale) -> sale
        | None -> failwith("This sale doesn't exist")
    ];

    if sale.active then skip else failwith("This sale isn't active anymore");
    if sale.price = Tezos.amount then skip else failwith("The amount of tez is incorrect");

    // On récupère le ledger pour pouvoir le modifier ensuite
    var balances : map(address, nat) := case Map.find_opt(sale.nft_id, s.balance) of [
    | Some (bal) -> bal
    | None -> failwith("You're trying to be send an unexisting NFT")
    ];

     // On récupère la balance du user concerné
     var user_balance : nat := case Map.find_opt(Tezos.self_address, balances) of [
    | Some (bal) -> bal
    | None -> failwith("You don't own the NFT")
    ]; 

    // Met à 0 la balance de l'expéditeur
    var updated_balance_map : map(address, nat) := if user_balance = 1n 
    then 
    Map.update(Tezos.self_address, Some(0n), balances)
    else failwith("You don't own the NFT II");

    // Met à 1 la balance du receveur
    var updated_balance_map2 : map(address, nat) := if user_balance = 1n 
    then 
    Map.update(Tezos.sender, Some(1n), updated_balance_map)
    else failwith("You don't own the NFT III");

    // Met à jour le storage du smart-contract
    s.balance[id] := updated_balance_map2;

    const to_pay_address : contract (unit) =
      case (Tezos.get_contract_opt (sale.to_pay) : option (contract (unit))) of[
        |Some (c) -> c
        | None -> (failwith ("Contract not found.") : contract (unit))
      ];
      const operations : list(operation) = list[
           Tezos.transaction (unit, sale.price, to_pay_address)
      ];
    sale.active := false;
    s.sales[id] := sale;
} with (operations, s)
// Les actions est un type qui permet de créer les entrypoints
type action is 
  | Mint of metadata
  | Burn of token_id
  | TransferFrom of transfer_from_params
  | SetApproval of set_approval_params
  | AddWhitelist of address
  | AddFile of addFile_params
  | CreateSale of listed_sale_params
  | Buy of nat

// Nos entrypoints
  function main(const action : action; const s : storage) : return is
  case action of [
    | Mint(metadata)    -> mint(metadata, s)
    | Burn(id) -> burn(id, s)
    | TransferFrom(params) -> transferFrom(params, s)
    | SetApproval(params) -> setApprovalForAll(params, s)
    | AddWhitelist(addr) -> addWhitelist(addr, s)
    | AddFile(files) -> addFile(files, s)
    | CreateSale(sale)-> createSale(sale, s)
    | Buy(sale_id) -> buySale(sale_id, s)
  ]
