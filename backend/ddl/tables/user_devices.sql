--
-- PostgreSQL database dump
--

\restrict VCkWHnIVim9f6tiFsbh6TBLAA7OhNVB65nkXRUlD3pmZRhQG14HJhkHuqhcdI1l

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
-- Name: user_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_devices (
    id integer NOT NULL,
    user_id integer NOT NULL,
    device_id character varying(64),
    fingerprint_hash character varying(64),
    user_agent character varying(500),
    platform character varying(50),
    browser character varying(50),
    ip_address character varying(45),
    ip_country character varying(10),
    is_trusted boolean,
    last_used_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_devices_id_seq OWNED BY public.user_devices.id;


--
-- Name: user_devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices ALTER COLUMN id SET DEFAULT nextval('public.user_devices_id_seq'::regclass);


--
-- Name: user_devices user_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_pkey PRIMARY KEY (id);


--
-- Name: ix_user_devices_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_devices_device_id ON public.user_devices USING btree (device_id);


--
-- Name: ix_user_devices_fingerprint_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_devices_fingerprint_hash ON public.user_devices USING btree (fingerprint_hash);


--
-- Name: ix_user_devices_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_devices_id ON public.user_devices USING btree (id);


--
-- Name: ix_user_devices_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_devices_user_id ON public.user_devices USING btree (user_id);


--
-- Name: user_devices user_devices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict VCkWHnIVim9f6tiFsbh6TBLAA7OhNVB65nkXRUlD3pmZRhQG14HJhkHuqhcdI1l

