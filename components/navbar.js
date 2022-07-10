export default function Navbar({}) {
  return (
    <div>
      <nav id="navbar">
        <span id="responsive-menu">
          <ul className="menu">
            <li id="marketplace">
              <a href="./marketplace">Marketplace</a>
            </li>
            <li id="collection">
              <a href="./users">Users</a>
            </li>
            <li id="newnft">
              <a href="./newnft">New NFT</a>
            </li>
            <li id="getnft">
              <a href="./getnft">Get NFT</a>
            </li>
            <li id="wallet">
              <a href="./#">Wallet</a>
            </li>
          </ul>
        </span>
      </nav>
    </div>
  );
}
