--
-- PostgreSQL database dump
--

\restrict MQXtuxwv585Zhleiy2YstTXj4Q0CUrxyINeCUo8XlQtSp50Q15DeShw3wyKAdV9

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
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(50),
    is_active boolean,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


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
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icon character varying(255),
    image_url character varying(500),
    parent_id integer,
    level integer DEFAULT 0,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    author_id integer,
    parent_id integer,
    content text NOT NULL,
    is_deleted boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


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
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer,
    order_id character varying(100) NOT NULL,
    payment_key character varying(255),
    method character varying(30) NOT NULL,
    status character varying(20),
    amount numeric(12,2) NOT NULL,
    paid_amount numeric(12,2),
    points_used integer,
    pg_provider character varying(50),
    card_company character varying(50),
    card_number character varying(20),
    description character varying(500),
    failure_reason text,
    refund_reason text,
    paid_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    refunded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


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
-- Name: post_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_images (
    id integer NOT NULL,
    post_id integer NOT NULL,
    image_url character varying(500) NOT NULL,
    thumbnail_url character varying(500),
    original_filename character varying(255),
    file_size integer,
    sort_order integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: post_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.post_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: post_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.post_images_id_seq OWNED BY public.post_images.id;


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_likes (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: post_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: post_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.post_likes_id_seq OWNED BY public.post_likes.id;


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
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image_url character varying(500) NOT NULL,
    sort_order integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: product_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_slots (
    id integer NOT NULL,
    product_id integer NOT NULL,
    slot_number integer NOT NULL,
    buyer_id integer,
    status character varying(20),
    payment_id integer,
    paid_price numeric(12,2),
    reserved_at timestamp with time zone,
    purchased_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    buyer_note text,
    admin_note text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_slots_id_seq OWNED BY public.product_slots.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    seller_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    category character varying(100),
    auction_type character varying(20),
    starting_price numeric(12,2) NOT NULL,
    current_price numeric(12,2),
    buy_now_price numeric(12,2),
    min_bid_increment numeric(12,2),
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    bid_count integer,
    status character varying(20),
    is_featured boolean,
    thumbnail_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    slot_price numeric(12,2),
    slot_count integer DEFAULT 1,
    sold_slot_count integer DEFAULT 0,
    category_id integer
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: shipping_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_addresses (
    id integer NOT NULL,
    user_id integer NOT NULL,
    alias character varying(50),
    is_default boolean,
    recipient_name_enc text NOT NULL,
    phone_enc text NOT NULL,
    zipcode_enc text NOT NULL,
    address1_enc text NOT NULL,
    address2_enc text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: shipping_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipping_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_addresses_id_seq OWNED BY public.shipping_addresses.id;


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
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255),
    phone character varying(20),
    name character varying(100),
    nickname character varying(100),
    profile_image character varying(500),
    provider character varying(20),
    provider_id character varying(255),
    password_hash character varying(255),
    status character varying(20),
    is_verified boolean,
    point_balance integer,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    phone_hash character varying(64),
    phone_verified_at timestamp with time zone,
    ci_hash character varying(64),
    ci_verified_at timestamp with time zone,
    verification_level character varying(20) DEFAULT 'none'::character varying,
    status_reason character varying(255),
    failed_login_count integer DEFAULT 0,
    locked_at timestamp with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


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
-- Name: wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlists (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wishlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wishlists_id_seq OWNED BY public.wishlists.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- Name: boards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boards ALTER COLUMN id SET DEFAULT nextval('public.boards_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: daily_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_stats ALTER COLUMN id SET DEFAULT nextval('public.daily_stats_id_seq'::regclass);


--
-- Name: forbidden_words id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forbidden_words ALTER COLUMN id SET DEFAULT nextval('public.forbidden_words_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: point_histories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.point_histories ALTER COLUMN id SET DEFAULT nextval('public.point_histories_id_seq'::regclass);


--
-- Name: post_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_attachments ALTER COLUMN id SET DEFAULT nextval('public.post_attachments_id_seq'::regclass);


--
-- Name: post_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_images ALTER COLUMN id SET DEFAULT nextval('public.post_images_id_seq'::regclass);


--
-- Name: post_likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes ALTER COLUMN id SET DEFAULT nextval('public.post_likes_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: product_slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_slots ALTER COLUMN id SET DEFAULT nextval('public.product_slots_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: shipping_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_addresses ALTER COLUMN id SET DEFAULT nextval('public.shipping_addresses_id_seq'::regclass);


--
-- Name: suspicious_activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suspicious_activities ALTER COLUMN id SET DEFAULT nextval('public.suspicious_activities_id_seq'::regclass);


--
-- Name: user_devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices ALTER COLUMN id SET DEFAULT nextval('public.user_devices_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: visitors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitors ALTER COLUMN id SET DEFAULT nextval('public.visitors_id_seq'::regclass);


--
-- Name: wishlists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists ALTER COLUMN id SET DEFAULT nextval('public.wishlists_id_seq'::regclass);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: daily_stats daily_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_stats
    ADD CONSTRAINT daily_stats_pkey PRIMARY KEY (id);


--
-- Name: forbidden_words forbidden_words_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forbidden_words
    ADD CONSTRAINT forbidden_words_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: point_histories point_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT point_histories_pkey PRIMARY KEY (id);


--
-- Name: post_attachments post_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_attachments
    ADD CONSTRAINT post_attachments_pkey PRIMARY KEY (id);


--
-- Name: post_images post_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_images
    ADD CONSTRAINT post_images_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_slots product_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_slots
    ADD CONSTRAINT product_slots_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: shipping_addresses shipping_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_addresses
    ADD CONSTRAINT shipping_addresses_pkey PRIMARY KEY (id);


--
-- Name: suspicious_activities suspicious_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suspicious_activities
    ADD CONSTRAINT suspicious_activities_pkey PRIMARY KEY (id);


--
-- Name: post_likes uq_post_like_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT uq_post_like_user UNIQUE (post_id, user_id);


--
-- Name: wishlists uq_wishlist_user_product; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id);


--
-- Name: user_devices user_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visitors visitors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: idx_categories_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_is_active ON public.categories USING btree (is_active);


--
-- Name: idx_categories_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_parent_id ON public.categories USING btree (parent_id);


--
-- Name: idx_categories_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: ix_admins_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_admins_email ON public.admins USING btree (email);


--
-- Name: ix_admins_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_admins_id ON public.admins USING btree (id);


--
-- Name: ix_banners_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_banners_id ON public.banners USING btree (id);


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
-- Name: ix_comments_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comments_author_id ON public.comments USING btree (author_id);


--
-- Name: ix_comments_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comments_id ON public.comments USING btree (id);


--
-- Name: ix_comments_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comments_parent_id ON public.comments USING btree (parent_id);


--
-- Name: ix_comments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_comments_post_id ON public.comments USING btree (post_id);


--
-- Name: ix_daily_stats_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_daily_stats_date ON public.daily_stats USING btree (date);


--
-- Name: ix_daily_stats_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_daily_stats_id ON public.daily_stats USING btree (id);


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
-- Name: ix_payments_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_payments_id ON public.payments USING btree (id);


--
-- Name: ix_payments_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_payments_order_id ON public.payments USING btree (order_id);


--
-- Name: ix_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_payments_status ON public.payments USING btree (status);


--
-- Name: ix_point_histories_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_point_histories_id ON public.point_histories USING btree (id);


--
-- Name: ix_point_histories_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_point_histories_user_id ON public.point_histories USING btree (user_id);


--
-- Name: ix_post_attachments_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_post_attachments_id ON public.post_attachments USING btree (id);


--
-- Name: ix_post_attachments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_post_attachments_post_id ON public.post_attachments USING btree (post_id);


--
-- Name: ix_post_images_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_post_images_id ON public.post_images USING btree (id);


--
-- Name: ix_post_images_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_post_images_post_id ON public.post_images USING btree (post_id);


--
-- Name: ix_post_likes_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_post_likes_id ON public.post_likes USING btree (id);


--
-- Name: ix_post_likes_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_post_likes_post_id ON public.post_likes USING btree (post_id);


--
-- Name: ix_post_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_post_likes_user_id ON public.post_likes USING btree (user_id);


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
-- Name: ix_product_images_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_images_id ON public.product_images USING btree (id);


--
-- Name: ix_product_slots_buyer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_slots_buyer_id ON public.product_slots USING btree (buyer_id);


--
-- Name: ix_product_slots_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_slots_id ON public.product_slots USING btree (id);


--
-- Name: ix_product_slots_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_slots_product_id ON public.product_slots USING btree (product_id);


--
-- Name: ix_product_slots_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_slots_status ON public.product_slots USING btree (status);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_products_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_products_status ON public.products USING btree (status);


--
-- Name: ix_shipping_addresses_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_shipping_addresses_id ON public.shipping_addresses USING btree (id);


--
-- Name: ix_shipping_addresses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_shipping_addresses_user_id ON public.shipping_addresses USING btree (user_id);


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
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_phone ON public.users USING btree (phone);


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
-- Name: ix_wishlists_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_wishlists_id ON public.wishlists USING btree (id);


--
-- Name: ix_wishlists_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_wishlists_product_id ON public.wishlists USING btree (product_id);


--
-- Name: ix_wishlists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_wishlists_user_id ON public.wishlists USING btree (user_id);


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: payments payments_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


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
-- Name: post_attachments post_attachments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_attachments
    ADD CONSTRAINT post_attachments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_images post_images_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_images
    ADD CONSTRAINT post_images_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


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
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_slots product_slots_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_slots
    ADD CONSTRAINT product_slots_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- Name: product_slots product_slots_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_slots
    ADD CONSTRAINT product_slots_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: product_slots product_slots_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_slots
    ADD CONSTRAINT product_slots_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: shipping_addresses shipping_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_addresses
    ADD CONSTRAINT shipping_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: suspicious_activities suspicious_activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suspicious_activities
    ADD CONSTRAINT suspicious_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_devices user_devices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict MQXtuxwv585Zhleiy2YstTXj4Q0CUrxyINeCUo8XlQtSp50Q15DeShw3wyKAdV9

