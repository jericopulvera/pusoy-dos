import { Formik, Form, Field } from "formik";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Button,
  Input,
  useToast,
} from "@chakra-ui/react";
import axios from "redaxios";
import jwtDecode from "jwt-decode";

export default function LoginForm(props) {
  const { setUser } = props;
  const toast = useToast();

  function validateUsername(value) {
    let error;

    if (!value) {
      error = "Username is required";
    }

    return error;
  }

  function validatePassword(value) {
    let error;

    if (!value) {
      error = "Password is required";
    }

    return error;
  }

  function submitLogin(values, actions) {
    axios
      .post("/api/login", values)
      .then((response) => {
        window.localStorage.setItem("token", response.data.token);
        setUser(jwtDecode(response.data.token));
      })
      .catch((error) => {
        toast({
          title: error.data.message,
          position: "top",
          isClosable: true,
          status: "error",
        });
        actions.setSubmitting(false);
      });
  }

  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={submitLogin}
    >
      {(props) => (
        <Form>
          <Field name="username" validate={validateUsername}>
            {({ field, form }) => (
              <FormControl
                isInvalid={form.errors.username && form.touched.username}
              >
                <FormLabel htmlFor="username">Username</FormLabel>
                <Input {...field} id="username" placeholder="username" />
                <FormErrorMessage>{form.errors.username}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Field name="password" validate={validatePassword}>
            {({ field, form }) => (
              <FormControl
                isInvalid={form.errors.password && form.touched.password}
                marginTop="4"
              >
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  {...field}
                  id="password"
                  placeholder="password"
                  type="password"
                />
                <FormErrorMessage>{form.errors.password}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Button
            mt={4}
            colorScheme="teal"
            isLoading={props.isSubmitting}
            type="submit"
            style={{ float: "right" }}
            width="100px"
          >
            Login
          </Button>
        </Form>
      )}
    </Formik>
  );
}
