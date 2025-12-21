--
-- PostgreSQL database dump
--

\restrict qAsbl5mJmc5OorNrarVIChPdQ1Is551KXTYRopiGgntkUtSZpuH3gx8ppgDmLU7

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
-- Name: product_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_slots (
    id integer NOT NULL,
    product_id integer NOT NULL,
    slot_number integer NOT NULL,
    buyer_id integer,
    status character varying(20),
    payment_id integer,
    paid_price numeric(12,2),
    reserved_at timestamp with time zone,
    purchased_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    buyer_note text,
    admin_note text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_slots_id_seq OWNED BY public.product_slots.id;


--
-- Name: product_slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_slots ALTER COLUMN id SET DEFAULT nextval('public.product_slots_id_seq'::regclass);


--
-- Name: product_slots product_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_slots
    ADD CONSTRAINT product_slots_pkey PRIMARY KEY (id);


--
-- Name: ix_product_slots_buyer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_slots_buyer_id ON public.product_slots USING btree (buyer_id);


--
-- Name: ix_product_slots_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_slots_id ON public.product_slots USING btree (id);


--
-- Name: ix_product_slots_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_slots_product_id ON public.product_slots USING btree (product_id);


--
-- Name: ix_product_slots_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_slots_status ON public.product_slots USING btree (status);


--
-- Name: product_slots product_slots_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_slots
    ADD CONSTRAINT product_slots_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- Name: product_slots product_slots_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_slots
    ADD CONSTRAINT product_slots_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: product_slots product_slots_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_slots
    ADD CONSTRAINT product_slots_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict qAsbl5mJmc5OorNrarVIChPdQ1Is551KXTYRopiGgntkUtSZpuH3gx8ppgDmLU7

