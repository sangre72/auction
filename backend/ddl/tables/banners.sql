--
-- PostgreSQL database dump
--

\restrict KHyyVD9Ixv7dqwLAzgFqeZGK2wJl7z4CFmae5AunZnIOx0h2hRZGFhdy144jRv3

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
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "position" character varying(30),
    type character varying(20),
    image_url character varying(500),
    mobile_image_url character varying(500),
    alt_text character varying(255),
    video_url character varying(500),
    html_content text,
    link_url character varying(500),
    link_target character varying(20),
    is_active boolean,
    sort_order integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    view_count integer,
    click_count integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: ix_banners_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_banners_id ON public.banners USING btree (id);


--
-- PostgreSQL database dump complete
--

\unrestrict KHyyVD9Ixv7dqwLAzgFqeZGK2wJl7z4CFmae5AunZnIOx0h2hRZGFhdy144jRv3

