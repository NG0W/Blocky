-- Database: ImmoBloc

CREATE TABLE IF NOT EXISTS public.agencies
(
    id SERIAL NOT NULL,
    name character varying(45) NOT NULL,
    code character varying(45) NOT NULL,
    address character varying(45) NOT NULL,
    CONSTRAINT agencies_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.assets
(
    id SERIAL NOT NULL,
    name character varying(45) NOT NULL,
    value integer NOT NULL,
    id_agency integer NOT NULL,
    id_status integer NOT NULL DEFAULT 1,
    max_refunds integer NOT NULL DEFAULT 100,
    CONSTRAINT assets_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.documents
(
    id SERIAL NOT NULL,
    name character varying(45) NOT NULL,
    id_asset integer NOT NULL,
    CONSTRAINT documents_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.offers
(
    id SERIAL NOT NULL,
    name character varying(45) NOT NULL,
    value integer NOT NULL,
    id_user integer NOT NULL,
    id_asset integer NOT NULL,
    id_status integer NOT NULL DEFAULT 1,
    CONSTRAINT offers_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.payments
(
    id SERIAL NOT NULL,
    name character varying(45) NOT NULL,
    value integer NOT NULL,
    due_date date NOT NULL,
    id_user integer NOT NULL,
    id_asset integer NOT NULL,
    id_status integer NOT NULL DEFAULT 1,
    CONSTRAINT payments_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.users
(
    id SERIAL NOT NULL,
    name character varying(45) NOT NULL,
    surname character varying(45) NOT NULL,
    mail character varying(45) NOT NULL,
    address character varying(45) NOT NULL,
    age date,
    salary integer,
    contrat_type integer,
    id_agency integer,
    id_status integer NOT NULL DEFAULT 1,
    validated boolean NOT NULL DEFAULT false,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);