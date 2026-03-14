--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

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

--
-- Name: ROLE; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ROLE" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."ROLE" OWNER TO postgres;

--
-- Name: role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public.role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO postgres;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    category_id bigint NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: category_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.category_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.category_category_id_seq OWNER TO postgres;

--
-- Name: category_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.category_category_id_seq OWNED BY public.category.category_id;


--
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    follow_id bigint NOT NULL,
    follower_id bigint,
    followee_id bigint
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- Name: follows_follow_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.follows_follow_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.follows_follow_id_seq OWNER TO postgres;

--
-- Name: follows_follow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.follows_follow_id_seq OWNED BY public.follows.follow_id;


--
-- Name: forumlike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forumlike (
    like_id bigint NOT NULL,
    user_id bigint,
    post_id bigint
);


ALTER TABLE public.forumlike OWNER TO postgres;

--
-- Name: forumlike_like_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.forumlike_like_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forumlike_like_id_seq OWNER TO postgres;

--
-- Name: forumlike_like_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.forumlike_like_id_seq OWNED BY public.forumlike.like_id;


--
-- Name: forumuser; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forumuser (
    user_id bigint NOT NULL,
    username character varying(15) NOT NULL,
    password character varying NOT NULL,
    email character varying(50) NOT NULL,
    description character varying(120) NOT NULL,
    icon bytea,
    role public.role DEFAULT 'USER'::public.role NOT NULL
);


ALTER TABLE public.forumuser OWNER TO postgres;

--
-- Name: forumuser_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.forumuser_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forumuser_user_id_seq OWNER TO postgres;

--
-- Name: forumuser_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.forumuser_user_id_seq OWNED BY public.forumuser.user_id;


--
-- Name: post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post (
    post_id bigint NOT NULL,
    category_id bigint,
    user_id bigint NOT NULL,
    title character varying(50),
    body text,
    date timestamp with time zone,
    parent_post_id bigint
);


ALTER TABLE public.post OWNER TO postgres;

--
-- Name: post_post_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.post_post_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_post_id_seq OWNER TO postgres;

--
-- Name: post_post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.post_post_id_seq OWNED BY public.post.post_id;


--
-- Name: postimage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.postimage (
    image_id bigint NOT NULL,
    post_id bigint,
    image bytea
);


ALTER TABLE public.postimage OWNER TO postgres;

--
-- Name: postimage_image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.postimage_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.postimage_image_id_seq OWNER TO postgres;

--
-- Name: postimage_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.postimage_image_id_seq OWNED BY public.postimage.image_id;


--
-- Name: refreshtoken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refreshtoken (
    token_id bigint NOT NULL,
    user_id bigint,
    token character varying(200) NOT NULL,
    expiry_date timestamp without time zone NOT NULL
);


ALTER TABLE public.refreshtoken OWNER TO postgres;

--
-- Name: refreshtoken_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refreshtoken_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refreshtoken_token_id_seq OWNER TO postgres;

--
-- Name: refreshtoken_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refreshtoken_token_id_seq OWNED BY public.refreshtoken.token_id;


--
-- Name: category category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category ALTER COLUMN category_id SET DEFAULT nextval('public.category_category_id_seq'::regclass);


--
-- Name: follows follow_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows ALTER COLUMN follow_id SET DEFAULT nextval('public.follows_follow_id_seq'::regclass);


--
-- Name: forumlike like_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forumlike ALTER COLUMN like_id SET DEFAULT nextval('public.forumlike_like_id_seq'::regclass);


--
-- Name: forumuser user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forumuser ALTER COLUMN user_id SET DEFAULT nextval('public.forumuser_user_id_seq'::regclass);


--
-- Name: post post_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post ALTER COLUMN post_id SET DEFAULT nextval('public.post_post_id_seq'::regclass);


--
-- Name: postimage image_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postimage ALTER COLUMN image_id SET DEFAULT nextval('public.postimage_image_id_seq'::regclass);


--
-- Name: refreshtoken token_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refreshtoken ALTER COLUMN token_id SET DEFAULT nextval('public.refreshtoken_token_id_seq'::regclass);


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);


--
-- Name: forumuser email_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forumuser
    ADD CONSTRAINT email_uniq UNIQUE (email);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (follow_id);


--
-- Name: forumlike forumlike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forumlike
    ADD CONSTRAINT forumlike_pkey PRIMARY KEY (like_id);


--
-- Name: forumuser forumuser_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forumuser
    ADD CONSTRAINT forumuser_pkey PRIMARY KEY (user_id);


--
-- Name: category name_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT name_uniq UNIQUE (name);


--
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (post_id);


--
-- Name: postimage postimage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postimage
    ADD CONSTRAINT postimage_pkey PRIMARY KEY (image_id);


--
-- Name: refreshtoken refreshtoken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refreshtoken
    ADD CONSTRAINT refreshtoken_pkey PRIMARY KEY (token_id);


--
-- Name: forumuser username_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forumuser
    ADD CONSTRAINT username_uniq UNIQUE (username);


--
-- Name: follows follows_followee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_followee_id_fkey FOREIGN KEY (followee_id) REFERENCES public.forumuser(user_id);


--
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.forumuser(user_id);


--
-- Name: forumlike forumlike_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forumlike
    ADD CONSTRAINT forumlike_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.forumuser(user_id);


--
-- Name: post post_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(category_id);


--
-- Name: post post_parent_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_parent_post_id_fkey FOREIGN KEY (parent_post_id) REFERENCES public.post(post_id);


--
-- Name: post post_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.forumuser(user_id);


--
-- Name: postimage postimage_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postimage
    ADD CONSTRAINT postimage_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.post(post_id);


--
-- Name: refreshtoken refreshtoken_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refreshtoken
    ADD CONSTRAINT refreshtoken_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.forumuser(user_id);


--
-- PostgreSQL database dump complete
--

