--
-- PostgreSQL database dump
--

\restrict vdSs35ZejyO2u2eqfMAdcgnUaoK0ZrqYKhtj18bOzftBszIgDhwrSGQxeF6hebD

-- Dumped from database version 17.6 (Homebrew)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: shipping_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_addresses (
    id integer NOT NULL,
    user_id integer NOT NULL,
    alias character varying(50),
    is_default boolean,
    recipient_name_enc text NOT NULL,
    phone_enc text NOT NULL,
    zipcode_enc text NOT NULL,
    address1_enc text NOT NULL,
    address2_enc text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: shipping_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipping_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_addresses_id_seq OWNED BY public.shipping_addresses.id;


--
-- Name: shipping_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_addresses ALTER COLUMN id SET DEFAULT nextval('public.shipping_addresses_id_seq'::regclass);


--
-- Name: shipping_addresses shipping_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_addresses
    ADD CONSTRAINT shipping_addresses_pkey PRIMARY KEY (id);


--
-- Name: ix_shipping_addresses_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_shipping_addresses_id ON public.shipping_addresses USING btree (id);


--
-- Name: ix_shipping_addresses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_shipping_addresses_user_id ON public.shipping_addresses USING btree (user_id);


--
-- Name: shipping_addresses shipping_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_addresses
    ADD CONSTRAINT shipping_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict vdSs35ZejyO2u2eqfMAdcgnUaoK0ZrqYKhtj18bOzftBszIgDhwrSGQxeF6hebD

