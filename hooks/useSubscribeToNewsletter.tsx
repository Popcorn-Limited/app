import MainActionButton from "components/MainActionButton";
import { setSingleActionModal } from "context/actions";
import { store } from "context/store";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

export const isValidEmailAddress = (email: string) => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(regex) === null;
};


const useSubscribeToNewsletter = (): {
  showNewsletterModal: () => void;
  subscribeToNewsLetter: ({ onSuccess, email }: { onSuccess: () => void; email: string }) => void;
  subscribing: boolean;
  subscriptionSuccessful: boolean;
} => {
  const { dispatch } = useContext(store);
  const [subscribing, setSubscribing] = useState<boolean>(false);
  const [subscriptionSuccessful, setSubscriptionSuccessful] = useState<boolean>(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const subscribeToNewsLetter = async ({ onSuccess, email }: { onSuccess: () => void; email: string }) => {
    if (email?.trim()?.length === 0 || isValidEmailAddress(email)) return;

    setSubscribing(true);
    try {
      await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "subscribed",
        }),
      });
      setSubscribing(false);
      setSubscriptionSuccessful(true);
      setTimeout(() => {
        setSubscriptionSuccessful(false);
      }, 5000);
      onSuccess();
    } catch (error) {
      setSubscribing(false);
      console.log(error);
    }
  };

  const showNewsletterModal = () => {
    dispatch(
      setSingleActionModal({
        image: <Image src="/images/newsletterAvatar.png" width={88} height={88} alt="newsletter avatar" />,
        title: "Sign up for our newsletter",
        children: (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = emailRef.current.value;
              subscribeToNewsLetter({
                email,
                onSuccess: () => {
                  dispatch(setSingleActionModal(false));
                  toast.success("Subscribed Successfully!");
                },
              });
            }}
          >
            <input
              type="email"
              name="EMAIL"
              id="mce-EMAIL"
              ref={emailRef}
              placeholder="Enter your email"
              className="border border-customLightGray rounded-lg h-14 w-full focus:border-customLightGray px-4 py-4 mb-6 md:mb-8"
            />
            <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
              <input type="text" name="b_5ce5e82d673fd2cfaf12849a5_e85a091ed3" tabIndex={-1} />
            </div>
            <MainActionButton label="Submit" type="submit" />
          </form>
        ),
        onDismiss: {
          onClick: () => dispatch(setSingleActionModal(false)),
        },
      }),
    );
  };

  useEffect(() => {
    try {
      const subscribedToNewsletter = localStorage.getItem("subscribedToNewsletter");
      if (!subscribedToNewsletter) {
        setTimeout(() => {
          //showNewsletterModal();
          localStorage.setItem("subscribedToNewsletter", "true");
        }, 3000);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  return {
    showNewsletterModal,
    subscribeToNewsLetter,
    subscribing,
    subscriptionSuccessful,
  };
};

export default useSubscribeToNewsletter;
