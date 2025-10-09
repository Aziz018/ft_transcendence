import Fuego from "../../index";
import { useState } from "../../index";
import SignUpFormContainer from "./components/SignUpFormContainer";

const Main = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (
    <>
      <SignUpFormContainer
        name={name}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        setName={setName}
        setEmail={setEmail}
        setPassword={setPassword}
        setConfirmPassword={setConfirmPassword}
      />
    </>
  );
};

export default Main;
