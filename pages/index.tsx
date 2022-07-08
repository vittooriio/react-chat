import type { NextPage } from "next";
import {
  getFirestore,
  collection,
  limit,
  orderBy,
  query,
  addDoc,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { FormEvent, RefObject, useEffect, useRef, useState } from "react";
import { serverTimestamp } from "@firebase/database";

const app = initializeApp({
  apiKey: "AIzaSyBjdqccDq9OSLHL8NgRKoOIYxfRnYFdT3Y",
  authDomain: "react-chat-396ac.firebaseapp.com",
  projectId: "react-chat-396ac",
  storageBucket: "react-chat-396ac.appspot.com",
  messagingSenderId: "279841131723",
  appId: "1:279841131723:web:ca3705452c200b4f215f4e",
  measurementId: "G-29KYL3M9S4",
});

const auth = getAuth(app);
const db = getFirestore(app);

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      alert(error);
    });
  };

  return (
    <>
      <div className="h-screen w-full bg-gradient-to-tl from-green-400 to-indigo-900 py-16 px-4 ">
        <div className="flex flex-col items-center justify-center">
          <div className="mt-16 w-full rounded bg-white p-10 shadow md:w-1/2 lg:w-1/3">
            <p
              tabIndex={0}
              className="text-2xl font-extrabold leading-6 text-gray-800 focus:outline-none"
            >
              Login
            </p>
            <button
              aria-label="Continue with google"
              onClick={signInWithGoogle}
              role="button"
              className="mt-10 flex w-full items-center rounded-lg border border-gray-700 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-1"
            >
              <img
                src="https://tuk-cdn.s3.amazonaws.com/can-uploader/sign_in-svg2.svg"
                alt="google"
              />
              <p className="ml-4 text-base font-medium text-gray-700">
                Continue with Google
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const SignOut = () => {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
};

const ChatRoom = () => {
  const dummy: RefObject<any> = useRef();
  const uid = auth.currentUser?.uid;
  const messagesRef = collection(db, "messages");
  const queryFetch = query(messagesRef, orderBy("createdAt"));
  const [messages] = useCollectionData(queryFetch);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.log(messages);
    dummy?.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const cssClasses = {
    sender: {
      div: "flex items-end justify-end",
      message:
        "px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white",
      container:
        "flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end",
    },
    receiver: {
      div: "flex items-end",
      message:
        "px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600",
      container:
        "flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start",
    },
  };
  return (
    <div className={"overflow-y-scroll"}>
      {messages?.map((msg, i) => {
        const cssProv = uid === msg.uid ? "sender" : "receiver";
        return (
          <div
            key={"msg-box-" + i}
            id="messages"
            className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
          >
            <div className="chat-message">
              <div className={cssClasses[cssProv].div}>
                <div className={cssClasses[cssProv].container}>
                  <div>
                    <span className={cssClasses[cssProv].message}>
                      {msg.text}
                    </span>
                  </div>
                </div>
                <img
                  src={msg.photoURL}
                  alt={msg.username}
                  className="w-6 h-6 rounded-full order-1"
                />
              </div>
            </div>
          </div>
        );
      })}
      <span ref={dummy}></span>
    </div>
  );
};

const ChatCommands = () => {
  const [formValue, setFormValue] = useState("");
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "messages"), {
      text: formValue,
      createdAt: Date.now(),
      uid: auth.currentUser?.uid,
      photoURL: auth.currentUser?.photoURL,
      username: auth.currentUser?.displayName,
    });
    setFormValue("");
    // dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
        <form onSubmit={sendMessage} className="relative flex">
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            type="text"
            placeholder="Write your message!"
            className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3"
          />
          <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
            <button
              disabled={!formValue}
              type="submit"
              className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
            >
              <span className="font-bold">Send</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6 ml-2 transform rotate-90"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const Chat = () => {
  return (
    <div>
      <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen">
        <ChatRoom />
        <ChatCommands />
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "\n.scrollbar-w-2::-webkit-scrollbar {\n  width: 0.25rem;\n  height: 0.25rem;\n}\n\n.scrollbar-track-blue-lighter::-webkit-scrollbar-track {\n  --bg-opacity: 1;\n  background-color: #f7fafc;\n  background-color: rgba(247, 250, 252, var(--bg-opacity));\n}\n\n.scrollbar-thumb-blue::-webkit-scrollbar-thumb {\n  --bg-opacity: 1;\n  background-color: #edf2f7;\n  background-color: rgba(237, 242, 247, var(--bg-opacity));\n}\n\n.scrollbar-thumb-rounded::-webkit-scrollbar-thumb {\n  border-radius: 0.25rem;\n}\n",
        }}
      />
    </div>
  );
};

const Home: NextPage = () => {
  const [user] = useAuthState(auth);
  return user ? <Chat /> : <SignIn />;
};

export default Home;
