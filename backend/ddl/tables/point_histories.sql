--
-- PostgreSQL database dump
--

\restrict 84D6mulsiNN45tHAjDb01jNFF32f3qBjJ4t8ieQKm0jL3kvD9f5NEzkRoINdDuQ

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
-- Name: point_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.point_histories (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(20) NOT NULL,
    reason character varying(50) NOT NULL,
    amount integer NOT NULL,
    balance integer NOT NULL,
    reference_id character varying(100),
    description text,
    admin_id integer,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: point_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.point_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: point_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.point_histories_id_seq OWNED BY public.point_histories.id;


--
-- Name: point_histories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.point_histories ALTER COLUMN id SET DEFAULT nextval('public.point_histories_id_seq'::regclass);


--
-- Name: point_histories point_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT point_histories_pkey PRIMARY KEY (id);


--
-- Name: ix_point_histories_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_point_histories_id ON public.point_histories USING btree (id);


--
-- Name: ix_point_histories_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_point_histories_user_id ON public.point_histories USING btree (user_id);


--
-- Name: point_histories point_histories_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT point_histories_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- Name: point_histories point_histories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT point_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 84D6mulsiNN45tHAjDb01jNFF32f3qBjJ4t8ieQKm0jL3kvD9f5NEzkRoINdDuQ

