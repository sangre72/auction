--
-- PostgreSQL database dump
--

\restrict bXindJdUgADLg0Sw4ISg0VWcelURNR9yXJjCFhIFfITniBwsAow21A6fRp0SUCQ

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
-- Name: suspicious_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suspicious_activities (
    id integer NOT NULL,
    user_id integer,
    activity_type character varying(50),
    severity character varying(20),
    details json,
    related_user_ids json,
    is_reviewed boolean,
    reviewed_by integer,
    reviewed_at timestamp with time zone,
    action_taken character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: suspicious_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suspicious_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suspicious_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suspicious_activities_id_seq OWNED BY public.suspicious_activities.id;


--
-- Name: suspicious_activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suspicious_activities ALTER COLUMN id SET DEFAULT nextval('public.suspicious_activities_id_seq'::regclass);


--
-- Name: suspicious_activities suspicious_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suspicious_activities
    ADD CONSTRAINT suspicious_activities_pkey PRIMARY KEY (id);


--
-- Name: ix_suspicious_activities_activity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_suspicious_activities_activity_type ON public.suspicious_activities USING btree (activity_type);


--
-- Name: ix_suspicious_activities_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_suspicious_activities_id ON public.suspicious_activities USING btree (id);


--
-- Name: ix_suspicious_activities_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_suspicious_activities_user_id ON public.suspicious_activities USING btree (user_id);


--
-- Name: suspicious_activities suspicious_activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suspicious_activities
    ADD CONSTRAINT suspicious_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict bXindJdUgADLg0Sw4ISg0VWcelURNR9yXJjCFhIFfITniBwsAow21A6fRp0SUCQ

