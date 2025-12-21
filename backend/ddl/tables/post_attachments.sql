--
-- PostgreSQL database dump
--

\restrict 89I5WOLPYbY4W4dqqLMwRgEWMcHgamObqCZho5FVuqmIaumWZE943K55ecoo62M

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
-- Name: post_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_attachments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    file_url character varying(500) NOT NULL,
    original_filename character varying(255) NOT NULL,
    file_size integer NOT NULL,
    file_type character varying(100),
    download_count integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: post_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.post_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: post_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.post_attachments_id_seq OWNED BY public.post_attachments.id;


--
-- Name: post_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_attachments ALTER COLUMN id SET DEFAULT nextval('public.post_attachments_id_seq'::regclass);


--
-- Name: post_attachments post_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_attachments
    ADD CONSTRAINT post_attachments_pkey PRIMARY KEY (id);


--
-- Name: ix_post_attachments_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_post_attachments_id ON public.post_attachments USING btree (id);


--
-- Name: ix_post_attachments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_post_attachments_post_id ON public.post_attachments USING btree (post_id);


--
-- Name: post_attachments post_attachments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_attachments
    ADD CONSTRAINT post_attachments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 89I5WOLPYbY4W4dqqLMwRgEWMcHgamObqCZho5FVuqmIaumWZE943K55ecoo62M

