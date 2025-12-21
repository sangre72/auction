--
-- PostgreSQL database dump
--

\restrict SxpUZugrhez8weaePoeWfV5XHYEc1HxiJMRKlX9beoUNneAFvzOO2eT4YiaII9R

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
-- Name: boards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.boards (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    read_permission character varying(20),
    write_permission character varying(20),
    comment_permission character varying(20),
    is_active boolean,
    sort_order integer,
    allow_attachments boolean,
    allow_images boolean,
    max_attachments integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: boards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.boards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: boards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.boards_id_seq OWNED BY public.boards.id;


--
-- Name: boards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boards ALTER COLUMN id SET DEFAULT nextval('public.boards_id_seq'::regclass);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: ix_boards_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_boards_id ON public.boards USING btree (id);


--
-- Name: ix_boards_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_boards_is_active ON public.boards USING btree (is_active);


--
-- Name: ix_boards_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_boards_name ON public.boards USING btree (name);


--
-- PostgreSQL database dump complete
--

\unrestrict SxpUZugrhez8weaePoeWfV5XHYEc1HxiJMRKlX9beoUNneAFvzOO2eT4YiaII9R

