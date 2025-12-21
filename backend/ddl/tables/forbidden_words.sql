--
-- PostgreSQL database dump
--

\restrict Zm591aeUf0ajZ01YWdLF2M9d1FDsWfyrUgK25zwg3KaRQeQnVbMmoAlKsNYVJSL

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
-- Name: forbidden_words; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forbidden_words (
    id integer NOT NULL,
    word character varying(200) NOT NULL,
    replacement character varying(200),
    match_type character varying(20),
    target character varying(30),
    is_active boolean,
    reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: forbidden_words_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forbidden_words_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forbidden_words_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forbidden_words_id_seq OWNED BY public.forbidden_words.id;


--
-- Name: forbidden_words id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forbidden_words ALTER COLUMN id SET DEFAULT nextval('public.forbidden_words_id_seq'::regclass);


--
-- Name: forbidden_words forbidden_words_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forbidden_words
    ADD CONSTRAINT forbidden_words_pkey PRIMARY KEY (id);


--
-- Name: ix_forbidden_words_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_forbidden_words_id ON public.forbidden_words USING btree (id);


--
-- Name: ix_forbidden_words_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_forbidden_words_is_active ON public.forbidden_words USING btree (is_active);


--
-- Name: ix_forbidden_words_word; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_forbidden_words_word ON public.forbidden_words USING btree (word);


--
-- PostgreSQL database dump complete
--

\unrestrict Zm591aeUf0ajZ01YWdLF2M9d1FDsWfyrUgK25zwg3KaRQeQnVbMmoAlKsNYVJSL

