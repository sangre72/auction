--
-- PostgreSQL database dump
--

\restrict CwUTnwrbS0JRbLNqFJe7CFmGyODGGhTNb9Yno6EiGrBAH4OJ4Jf1VBpcWy6KSbk

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
-- Name: daily_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_stats (
    id integer NOT NULL,
    date date NOT NULL,
    total_visits integer,
    unique_visitors integer,
    new_visitors integer,
    returning_visitors integer,
    page_views integer,
    avg_pages_per_session integer,
    desktop_visits integer,
    mobile_visits integer,
    tablet_visits integer,
    new_signups integer,
    active_users integer,
    total_orders integer,
    total_revenue integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: daily_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.daily_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: daily_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.daily_stats_id_seq OWNED BY public.daily_stats.id;


--
-- Name: daily_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_stats ALTER COLUMN id SET DEFAULT nextval('public.daily_stats_id_seq'::regclass);


--
-- Name: daily_stats daily_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_stats
    ADD CONSTRAINT daily_stats_pkey PRIMARY KEY (id);


--
-- Name: ix_daily_stats_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_daily_stats_date ON public.daily_stats USING btree (date);


--
-- Name: ix_daily_stats_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_daily_stats_id ON public.daily_stats USING btree (id);


--
-- PostgreSQL database dump complete
--

\unrestrict CwUTnwrbS0JRbLNqFJe7CFmGyODGGhTNb9Yno6EiGrBAH4OJ4Jf1VBpcWy6KSbk

