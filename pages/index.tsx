import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";
import { Testimonials } from "../components/Testimonials";
import useSWR from "swr";
import {useSession} from "next-auth/react";

const Home: NextPage = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, mutate } = useSWR("/api/remaining", fetcher);
  const { data: session, status } = useSession();

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Morse Toss</title>
      </Head>

      <Header
          photo={session?.user?.image || undefined}
          email={session?.user?.email || undefined}
          credits={data?.remainingGenerations || 0}
      />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mt-20 mt-20 mb-32 background-gradient">
        {/*<a*/}
        {/*  href="https://vercel.fyi/roomGPT"*/}
        {/*  target="_blank"*/}
        {/*  rel="noreferrer"*/}
        {/*  className="border border-gray-700 rounded-lg py-2 px-4 text-gray-400 text-sm mb-5 transition duration-300 ease-in-out hover:text-gray-300"*/}
        {/*>*/}
        {/*  Clone and deploy your own with{" "}*/}
        {/*  <span className="text-blue-600">Vercel</span>*/}
        {/*</a>*/}
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-normal text-gray-300 sm:text-7xl">
          <p className="mb-4">AI가 작성해주는</p>
          <p>영문 이메일</p>
          {/*<span className="relative whitespace-nowrap text-blue-600">*/}
          {/*  <SquigglyLines />*/}
          {/*  <span className="relative">using AI</span>*/}
          {/*</span>{" "}*/}
          {/*for everyone.*/}
        </h1>
        <h2 className="mx-auto mt-12 max-w-xl text-lg sm:text-gray-400  text-gray-500 leading-7">
          키워드나 핵심내용을 입력하면, AI가 이메일을 작성해줍니다.<br></br>
          오늘 바로 시작해보세요.
        </h2>
        <Link
          className="bg-blue-600 rounded-md text-2xl font-medium px-12 py-5 sm:mt-10 mt-8 hover:bg-blue-500 transition"
          href="/morse"
        >
          이메일 작성하기
        </Link>
        {/*<div className="flex justify-between items-center w-full flex-col sm:mt-10 mt-6">*/}
        {/*  <div className="flex flex-col space-y-10 mt-4 mb-16">*/}
        {/*    <div className="flex sm:space-x-8 sm:flex-row flex-col">*/}
        {/*      <div>*/}
        {/*        <h3 className="mb-1 font-medium text-lg">Original Room</h3>*/}
        {/*        <Image*/}
        {/*          alt="Original photo of a room"*/}
        {/*          src="/1.jpg"*/}
        {/*          className="w-full object-cover h-96 rounded-2xl"*/}
        {/*          width={400}*/}
        {/*          height={400}*/}
        {/*        />*/}
        {/*      </div>*/}
        {/*      <div className="sm:mt-0 mt-8">*/}
        {/*        <h3 className="mb-1 font-medium text-lg">Generated Room</h3>*/}
        {/*        <Image*/}
        {/*          alt="Generated photo of a room with roomGPT.io"*/}
        {/*          width={400}*/}
        {/*          height={400}*/}
        {/*          src="/1-new.jpg"*/}
        {/*          className="w-full object-cover h-96 rounded-2xl sm:mt-0 mt-2"*/}
        {/*        />*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </main>
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;
