import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { UploadDropzone } from "react-uploader";
import { Uploader } from "uploader";
import { CompareSlider } from "../components/CompareSlider";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import Toggle from "../components/Toggle";
import appendNewToName from "../utils/appendNewToName";
import downloadPhoto from "../utils/downloadPhoto";
import DropDown from "../components/DropDown";
import { roomType, rooms, themeType, themes } from "../utils/dropdownTypes";
import { GenerateResponseData } from "./api/generate";
import { useSession, signIn } from "next-auth/react";
import useSWR from "swr";
import { Rings } from "react-loader-spinner";
import Link from "next/link";
import { useRouter } from "next/router";
import { Toaster, toast } from "react-hot-toast";

// Configuration for the uploader
const uploader = Uploader({
  apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
    ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
    : "free",
});

const Home: NextPage = () => {
  const [myCompanyInput, setMyCompanyInput] = useState("");
  const [myNameInput, setMyNameInput] = useState("");
  const [reCompanyInput, setReCompanyInput] = useState("");
  const [reNameInput, setReNameInput] = useState("");
  const [emailBodyInput, setEmailBodyInput] = useState("");
  // const [purposeInput, setPurposeInput] = useState("");
  // const [questionInput, setQuestionInput] = useState("");
  const [introInput, setIntroInput] = useState(true);
  const [result, setResult] = useState();
  const [result_lo, setResult_lo] = useState();

  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, mutate } = useSWR("/api/remaining", fetcher);
  const { data: session, status } = useSession();


  async function onSubmit(event: React.FormEvent<HTMLFormElement> | any ) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/generate3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          myCompanyText: myCompanyInput,
          myNameText: myNameInput,
          reCompanyText: reCompanyInput,
          reNameText: reNameInput,
          emailBodyText: emailBodyInput,
          introText: introInput,
          // purposeText: purposeInput,
          // questionText: questionInput
        }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        if (response.status === 429 || response.status === 403 || response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error(
              `${response.status}: 사용량이 많습니다. 잠시후 다시 시도해주세요.`
          );
        } else {
          throw (
              data.error ||
              new Error(`Request failed with status ${response.status}`)
          );
        }
      }
      console.log(data.result);
      setResult(data.result);
      // setMyCompanyInput("");
      // setMyNameInput("");
      // setReCompanyInput("");
      // setReNameInput("");
      // setPurposeInput("");
      // setQuestionInput("");
    } catch (error : any) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
    setLoading(false);
  }

  const router = useRouter();

  useEffect(() => {
    if (router.query.success === "true") {
      toast.success("Payment successful!");
    }
  }, [router.query.success]);

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
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-10 sm:mb-0 mb-8">
        {/*{status === "authenticated" ? (*/}
        {/*  <Link*/}
        {/*    href="/buy-credits"*/}
        {/*    className="border border-gray-700 rounded-2xl py-2 px-4 text-gray-400 text-sm my-6 duration-300 ease-in-out hover:text-gray-300 hover:scale-105 transition"*/}
        {/*  >*/}
        {/*    Pricing is now available.{" "}*/}
        {/*    <span className="font-semibold text-gray-200">Click here</span> to*/}
        {/*    buy credits!*/}
        {/*  </Link>*/}
        {/*) : (*/}
        {/*  <a*/}
        {/*    href="https://twitter.com/nutlope/status/1635674124738523139?cxt=HHwWhsCz1ei8irMtAAAA"*/}
        {/*    target="_blank"*/}
        {/*    rel="noopener noreferrer"*/}
        {/*    className="border border-gray-700 rounded-2xl py-2 px-4 text-gray-400 text-sm my-6 duration-300 ease-in-out hover:text-gray-300 transition"*/}
        {/*  >*/}
        {/*    Over{" "}*/}
        {/*    <span className="font-semibold text-gray-200">1 million users</span>{" "}*/}
        {/*    have used roomGPT so far*/}
        {/*  </a>*/}
        {/*)}*/}
        <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-100 sm:text-6xl mb-5">
          Write your <span className="text-blue-600">email</span>
        </h1>
        {status === "authenticated" && data && !result && (
          <p className="text-gray-400">
            You have{" "}
            <span className="font-semibold text-gray-300">
              {data.remainingGenerations}{" "}
              {data?.remainingGenerations > 1 ? "credits" : "credit"}
            </span>{" "}
            left.{" "}
            {data.remainingGenerations < 2 && (
              <span>
                Buy more credits{" "}
                <Link
                  href="/buy-credits"
                  className="font-semibold text-gray-300 underline underline-offset-2 hover:text-gray-200 transition"
                >
                  here
                </Link>
                .
              </span>
            )}
          </p>
        )}


        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="flex justify-between items-center w-full flex-col mt-4">

              <div className={`${result ?
                  "lg:max-w-5xl":
                  "max-w-md"}`
                  + ` w-full flex flex-wrap md:flex-row flex-col justify-items-center lg:gap-10 md:gap-3`
              }>
              {status === "loading" ? (
                <div className="max-w-[670px] h-[250px] flex justify-center items-center">
                  <Rings
                    height="100"
                    width="100"
                    color="white"
                    radius="6"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    ariaLabel="rings-loading"
                  />
                </div>
              ) : status === "authenticated" ? (
                <div className="flex-1">
                  <form onSubmit={onSubmit}>
                    <div className=" grid grid-cols-1 gap-x-3 sm:grid-cols-6 w-full">
                      <div className="sm:col-span-6">
                        <div className="flex items-center space-x-3">
                          {/*<Image*/}
                          {/*  src="/number-1-white.svg"*/}
                          {/*  width={30}*/}
                          {/*  height={30}*/}
                          {/*  alt="1 icon"*/}
                          {/*/>*/}
                          <label htmlFor="myName" className="block text-sm font-bold leading-6">
                            발신자 정보 입력
                          </label>
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <div className="mt-2">
                          <div className="flex rounded-md bg-gray-800 shadow-sm overflow-hidden ring-1 ring-gray-600
                                  focus-within:ring-2 focus-within:ring-indigo-500">
                            <label className="flex flex-none select-none items-center pl-2 text-gray-500 sm:text-sm" htmlFor='myName'>이름:</label>
                            <input
                                type="text"
                                name="myName"
                                id="myName"
                                autoComplete="myName"
                                className="block flex-1 border-0 bg-transparent pl-1 text-gray-100 h-8
                                          placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-5"
                                placeholder=""
                                required
                                value={myNameInput}
                                onChange={(e) => setMyNameInput(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <div className="mt-2">
                          <div className="flex rounded-md bg-gray-800 shadow-sm overflow-hidden ring-1 ring-gray-600
                           focus-within:ring-2 focus-within:ring-indigo-500">
                            <label className="flex flex-none select-none items-center pl-3 text-gray-500 sm:text-sm" htmlFor='myCompany'>소속:</label>
                            <input
                                type="text"
                                name="myCompany"
                                id="myCompany"
                                autoComplete="myCompany"
                                className="block flex-1 border-0 bg-transparent pl-1 text-gray-100 h-8
                                          placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-5"
                                placeholder=""
                                value={myCompanyInput}
                                onChange={(e) => setMyCompanyInput(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-6">
                        <div className="flex items-center mt-8">
                          <label htmlFor="reName" className="block text-sm font-bold leading-6">
                            수신자 정보 입력
                          </label>
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <div className="mt-2">
                          <div className="flex rounded-md bg-gray-800 shadow-sm overflow-hidden ring-1 ring-gray-600
                           focus-within:ring-2 focus-within:ring-indigo-500">
                            <label className="flex flex-none select-none items-center pl-3 text-gray-500 sm:text-sm" htmlFor='reName'>이름:</label>
                            <input
                                type="text"
                                name="reName"
                                id="reName"
                                autoComplete="reName"
                                className="block flex-1 border-0 bg-transparent pl-1 text-gray-100 h-8
                                          placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-5"
                                placeholder=""
                                required
                                value={reNameInput}
                                onChange={(e) => setReNameInput(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <div className="mt-2">
                          <div className="flex rounded-md bg-gray-800 shadow-sm overflow-hidden ring-1 ring-gray-600
                           focus-within:ring-2 focus-within:ring-indigo-500">
                            <label className="flex flex-none select-none items-center pl-3 text-gray-500 sm:text-sm" htmlFor='reCompany'>소속:</label>
                            <input
                                type="text"
                                name="reCompany"
                                id="reCompany"
                                autoComplete="reCompany"
                                className="block flex-1 border-0 bg-transparent pl-1 text-gray-100 h-8
                                          placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-5"
                                placeholder=""
                                value={reCompanyInput}
                                onChange={(e) => setReCompanyInput(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                          <div className="flex items-center mt-8">
                              <label htmlFor="emailBody" className="block text-sm font-bold leading-6">
                              내용 입력
                              </label>
                          </div>
                        <div className="mt-2">
                          <textarea
                              id="emailBody"
                              name="emailBody"
                              rows={6}
                              placeholder="목적이나 질문을 작성하세요."
                              className="block w-full border-0 py-1.5 text-sm rounded-md bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-600
                               focus-within:ring-2 focus-within:ring-indigo-500 sm:leading-6"
                              value={emailBodyInput}
                              onChange={(e) => setEmailBodyInput(e.target.value)}
                          />
                        </div>
                        <div className="relative flex gap-x-2 justify-center mt-6">
                          <div className="flex h-6 items-center">
                            <input
                                id="intro"
                                name="intro"
                                type="checkbox"
                                checked={introInput}
                                className="h-4 w-4 rounded ring-gray-600 bg-gray-800 text-indigo-600
                                 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-2 focus:ring-offset-gray-800"
                                onChange={(e) => setIntroInput(e.target.checked)}
                            />
                          </div>
                          <div className="text-sm leading-6">
                            <label htmlFor="intro" className="font-medium text-gray-300">
                              첫 소개 인사말 포함
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center mt-4 mb-10">
                      <button
                        disabled={loading}
                        // onClick={() => {
                        //   setRestoredLoaded(false);
                        //   setError(null);
                        // }}
                        type="submit"
                        className="bg-blue-500 rounded-md text-white text-md font-medium px-10 py-2 hover:bg-blue-500/80 transition"
                      >
                        {loading ? (
                            <span className="pt-4">
                              <LoadingDots color="white" style="large" />
                            </span>
                          ) : (
                            <span>영문 이메일 작성</span>
                          )}
                      </button>
                    </div>

                  </form>
                </div>

              ) : (

                <div className="h-[250px] flex flex-col items-center space-y-6 max-w-[670px] -mt-8">
                  <div className="max-w-xl text-gray-300">
                    {/*Sign in below with Google to create a free account and*/}
                    {/*redesign your room today. You will get 3 generations for*/}
                    {/*free.*/}
                    지금 Google로 로그인하고 무료계정을 만들어 email을 작성하세요.
                    {/*3회의 제너레이션을 무료로 받을 수 있습니다.*/}
                  </div>
                  <button
                    onClick={() => signIn('google')}
                    className="bg-gray-200 text-black font-semibold py-3 px-6 rounded-2xl flex items-center space-x-2"
                  >
                    <Image
                      src="/google.png"
                      width={20}
                      height={20}
                      alt="google's logo"
                    />
                    <span>Sign in with Google</span>
                  </button>
                </div>

              )}

              {result && (
                <div className="flex-1">
                  <div className="flex items-center">
                    <label className="block text-sm font-bold leading-6">
                      영문 이메일 작성 결과
                    </label>
                  </div>
                  <div className="mt-2">
                    <textarea
                        id="result"
                        name="result"
                        readOnly
                        rows={20}
                        // className={styles.result}
                        value={result}
                        className="relative w-full block border-0 py-1.5 text-sm rounded-md bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-600
                               focus-within:ring-1 focus-within:ring-inset focus-within:ring-gray-600 sm:leading-6"
                    />
                  </div>
                  {/*<div className="mt-8">*/}
                  {/*  <h2 className="mb-1 font-medium text-lg">영문 결과 한글번역</h2>*/}
                  {/*  <textarea*/}
                  {/*      id="result_lo"*/}
                  {/*      name="result_lo"*/}
                  {/*      readOnly*/}
                  {/*      rows={10}*/}
                  {/*      // className={styles.result}*/}
                  {/*      value={result_lo}*/}
                  {/*      className="relative w-full block border-0 py-1.5 text-sm rounded-md bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-600*/}
                  {/*             focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 sm:max-w-md sm:leading-6"*/}
                  {/*  />*/}
                  {/*</div>*/}
                </div>
              )}

              </div>

              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8 max-w-[575px]"
                  role="alert"
                >
                  <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                    Please try again later.
                  </div>
                  <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                    {error}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
        <Toaster position="top-center" reverseOrder={false} />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
