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
  const [isDisable, setIsDisable] = useState(false);

  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [theme, setTheme] = useState<themeType>("Modern");
  const [room, setRoom] = useState<roomType>("Living Room");

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, mutate } = useSWR("/api/remaining", fetcher);
  const { data: session, status } = useSession();

  const options = {
    maxFileCount: 1,
    mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
    editor: { images: { crop: false } },
    tags: [data?.remainingGenerations > 3 ? "paid" : "free"],
    styles: {
      colors: {
        primary: "#2563EB", // Primary buttons & links
        error: "#d23f4d", // Error messages
        shade100: "#fff", // Standard text
        shade200: "#fffe", // Secondary button text
        shade300: "#fffd", // Secondary button text (hover)
        shade400: "#fffc", // Welcome text
        shade500: "#fff9", // Modal close button
        shade600: "#fff7", // Border
        shade700: "#fff2", // Progress indicator background
        shade800: "#fff1", // File item background
        shade900: "#ffff", // Various (draggable crop buttons, etc.)
      },
    },
    onValidate: async (file: File): Promise<undefined | string> => {
      return data.remainingGenerations === 0
        ? `No more credits left. Buy more above.`
        : undefined;
    },
  };


  async function onSubmit(event: React.FormEvent<HTMLFormElement> | any ) {
    event.preventDefault();
    setIsDisable(true);
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
    setIsDisable(false);
  }

  async function generatePhoto(fileUrl: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setLoading(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: fileUrl, theme, room }),
    });

    let response = (await res.json()) as GenerateResponseData;
    if (res.status !== 200) {
      setError(response as any);
    } else {
      mutate();
      const rooms =
        (JSON.parse(localStorage.getItem("rooms") || "[]") as string[]) || [];
      rooms.push(response.id);
      localStorage.setItem("rooms", JSON.stringify(rooms));
      setRestoredImage(response.generated);
    }
    setTimeout(() => {
      setLoading(false);
    }, 1300);
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
        {status === "authenticated" && data && !restoredImage && (
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
              {restoredImage && (
                <div>
                  Here's your remodeled <b>{room.toLowerCase()}</b> in the{" "}
                  <b>{theme.toLowerCase()}</b> theme!{" "}
                </div>
              )}
              <div
                className={`${
                  restoredLoaded ? "visible mt-6 -ml-8" : "invisible"
                }`}
              >
                <Toggle
                  className={`${restoredLoaded ? "visible mb-6" : "invisible"}`}
                  sideBySide={sideBySide}
                  setSideBySide={(newVal) => setSideBySide(newVal)}
                />
              </div>
              {restoredLoaded && sideBySide && (
                <CompareSlider
                  original={originalPhoto!}
                  restored={restoredImage!}
                />
              )}
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
              ) : status === "authenticated" && !originalPhoto ? (
                <div className="max-w-xl w-full">
                  <form className="" action="#" method="POST">
                    <div className=" grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-6 w-full">
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
                          <div className="flex rounded-md bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-600
                                  focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 sm:max-w-md">
                            <label className="flex select-none items-center pl-3 text-gray-500 sm:text-sm" htmlFor='myName'>이름:</label>
                            <input
                                type="text"
                                name="myName"
                                id="myName"
                                autoComplete="myName"
                                className="block flex-1 border-0 bg-transparent m-0.5 pl-1 text-gray-100 h-8
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
                          <div className="flex rounded-md bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 sm:max-w-md">
                            <label className="flex select-none items-center pl-3 text-gray-500 sm:text-sm" htmlFor='myCompany'>소속:</label>
                            <input
                                type="text"
                                name="myCompany"
                                id="myCompany"
                                autoComplete="myCompany"
                                className="block flex-1 border-0 bg-transparent m-0.5 pl-1 text-gray-100 h-8
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
                          <div className="flex rounded-md bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 sm:max-w-md">
                            <label className="flex select-none items-center pl-3 text-gray-500 sm:text-sm" htmlFor='reName'>이름:</label>
                            <input
                                type="text"
                                name="reName"
                                id="reName"
                                autoComplete="reName"
                                className="block flex-1 border-0 bg-transparent m-0.5 pl-1 text-gray-100 h-8
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
                          <div className="flex rounded-md bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 sm:max-w-md">
                            <label className="flex select-none items-center pl-3 text-gray-500 sm:text-sm" htmlFor='reCompany'>소속:</label>
                            <input
                                type="text"
                                name="reCompany"
                                id="reCompany"
                                autoComplete="reCompany"
                                className="block flex-1 border-0 bg-transparent m-0.5 pl-1 text-gray-100 h-8
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
                                 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 sm:max-w-mdsm:leading-6"
                                defaultValue={''}
                                value={emailBodyInput}
                                onChange={(e) => setEmailBodyInput(e.target.value)}
                            />
                          </div>
                        </div>

                    </div>





                  </form>
                </div>




              ) : (
                !originalPhoto && (
                  <div className="h-[250px] flex flex-col items-center space-y-6 max-w-[670px] -mt-8">
                    <div className="max-w-xl text-gray-300">
                      {/*Sign in below with Google to create a free account and*/}
                      {/*redesign your room today. You will get 3 generations for*/}
                      {/*free.*/}
                      지금 Google로 로그인하고 무료계정을 만들어 email을 작성하세요.
                      {/*3회의 제너레이션을 무료로 받을 수 있습니다.*/}
                    </div>
                    <button
                      onClick={() => signIn()}
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
                )
              )}
              {originalPhoto && !restoredImage && (
                <Image
                  alt="original photo"
                  src={originalPhoto}
                  className="rounded-2xl h-96"
                  width={475}
                  height={475}
                />
              )}
              {restoredImage && originalPhoto && !sideBySide && (
                <div className="flex sm:space-x-4 sm:flex-row flex-col">
                  <div>
                    <h2 className="mb-1 font-medium text-lg">Original Room</h2>
                    <Image
                      alt="original photo"
                      src={originalPhoto}
                      className="rounded-2xl relative w-full h-96"
                      width={475}
                      height={475}
                    />
                  </div>
                  <div className="sm:mt-0 mt-8">
                    <h2 className="mb-1 font-medium text-lg">Generated Room</h2>
                    <a href={restoredImage} target="_blank" rel="noreferrer">
                      <Image
                        alt="restored photo"
                        src={restoredImage}
                        className="rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in w-full h-96"
                        width={475}
                        height={475}
                        onLoadingComplete={() => setRestoredLoaded(true)}
                      />
                    </a>
                  </div>
                </div>
              )}
              {loading && (
                <button
                  disabled
                  className="bg-blue-500 rounded-full text-white font-medium px-4 pt-2 pb-3 mt-8 w-40"
                >
                  <span className="pt-4">
                    <LoadingDots color="white" style="large" />
                  </span>
                </button>
              )}
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
              <div className="flex space-x-2 justify-center">
                {!loading && !error && (
                  <button
                    onClick={() => {
                      setOriginalPhoto(null);
                      setRestoredImage(null);
                      setRestoredLoaded(false);
                      setError(null);
                    }}
                    className="bg-blue-500 rounded-full text-white font-medium px-4 py-2 mt-8 hover:bg-blue-500/80 transition"
                  >
                    Generate New Room
                  </button>
                )}
                {restoredLoaded && (
                  <button
                    onClick={() => {
                      downloadPhoto(
                        restoredImage!,
                        appendNewToName(photoName!)
                      );
                    }}
                    className="bg-white rounded-full text-black border font-medium px-4 py-2 mt-8 hover:bg-gray-100 transition"
                  >
                    Download Generated Room
                  </button>
                )}
              </div>
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
