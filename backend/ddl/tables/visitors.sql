--
-- PostgreSQL database dump
--

\restrict 69QT7Ld7WSgRFmy83fVS9NhOLj4AArkRCcNtmA3HduEvA4tfcGpIm9oOPVIOlGa

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
-- Name: visitors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visitors (
    id integer NOT NULL,
    ip_address character varying(45),
    user_agent text,
    device_type character varying(20),
    browser character varying(50),
    os character varying(50),
    page_url character varying(500),
    referrer character varying(500),
    session_id character varying(100),
    user_id integer,
    country character varying(100),
    city character varying(100),
    visited_at timestamp with time zone DEFAULT now()
);


--
-- Name: visitors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.visitors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visitors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.visitors_id_seq OWNED BY public.visitors.id;


--
-- Name: visitors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitors ALTER COLUMN id SET DEFAULT nextval('public.visitors_id_seq'::regclass);


--
-- Name: visitors visitors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_pkey PRIMARY KEY (id);


--
-- Name: ix_visitors_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_visitors_id ON public.visitors USING btree (id);


--
-- Name: ix_visitors_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_visitors_session_id ON public.visitors USING btree (session_id);


--
-- Name: ix_visitors_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_visitors_user_id ON public.visitors USING btree (user_id);


--
-- Name: ix_visitors_visited_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_visitors_visited_at ON public.visitors USING btree (visited_at);


--
-- PostgreSQL database dump complete
--

\unrestrict 69QT7Ld7WSgRFmy83fVS9NhOLj4AArkRCcNtmA3HduEvA4tfcGpIm9oOPVIOlGa

