--
-- PostgreSQL database dump
--

\restrict Yxw5O6Gfib77i0Qg2IabRa8dvViC9ShWnE01hYBOda0iell5WdzsN65lIxf5Q79

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
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    board_id integer NOT NULL,
    author_id integer,
    title character varying(300) NOT NULL,
    content text NOT NULL,
    status character varying(20),
    is_pinned boolean,
    is_notice boolean,
    view_count integer,
    like_count integer,
    comment_count integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: ix_posts_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_posts_author_id ON public.posts USING btree (author_id);


--
-- Name: ix_posts_board_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_posts_board_id ON public.posts USING btree (board_id);


--
-- Name: ix_posts_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_posts_id ON public.posts USING btree (id);


--
-- Name: ix_posts_is_notice; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_posts_is_notice ON public.posts USING btree (is_notice);


--
-- Name: ix_posts_is_pinned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_posts_is_pinned ON public.posts USING btree (is_pinned);


--
-- Name: ix_posts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_posts_status ON public.posts USING btree (status);


--
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: posts posts_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Yxw5O6Gfib77i0Qg2IabRa8dvViC9ShWnE01hYBOda0iell5WdzsN65lIxf5Q79

