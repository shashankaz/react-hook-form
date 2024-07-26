import { useEffect } from "react";
import { FieldErrors, useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";

let renderCount = 0;

const formSchema = yup.object({
  username: yup.string().required("Username is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required")
    .notOneOf(["admin@example.com"], "Enter a different email address")
    .test("notBlackListed", "This domain is not supported", (value) => {
      return value ? !value.endsWith("baddomain.com") : true;
    })
    .test("emailAvailable", "Email already exists", async (value) => {
      if (value) {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users?email=${value}`
        );
        const data = await response.json();
        return data.length === 0;
      }
      return true;
    }),
  channel: yup.string().required("Channel is required"),
  address: yup.object({
    line1: yup.string().required("Address is required"),
    line2: yup.string().optional(),
  }),
  age: yup
    .number()
    .typeError("Age must be a number")
    .required("Age is required")
    .positive("Age must be a positive number")
    .integer("Age must be an integer"),
  dob: yup
    .date()
    .required("Date of Birth is required")
    .typeError("Date of Birth is required"),
  phone: yup.array(
    yup.object({
      number: yup.string().required("Phone number is required"),
    })
  ),
});

type FormValues = yup.InferType<typeof formSchema>;

export const YupYouTubeForm = () => {
  const form = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: async () => {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users/1"
      );
      const data = await response.json();
      return {
        username: "Batman",
        email: data.email,
        channel: "",
        address: {
          line1: "",
          line2: "",
        },
        age: 0,
        dob: new Date(),
        phone: [{ number: "" }],
      };
    },
    mode: "onTouched",
  });

  const {
    register,
    control,
    handleSubmit,
    formState,
    watch,
    getValues,
    setValue,
    reset,
    trigger,
  } = form;

  const { fields, append, remove } = useFieldArray({
    name: "phone",
    control,
  });

  const {
    errors,
    isDirty,
    touchedFields,
    dirtyFields,
    isValid,
    isSubmitting,
    isSubmitted,
    isSubmitSuccessful,
    submitCount,
  } = formState;

  console.log({ errors, isDirty, touchedFields, dirtyFields, isValid });
  console.log({ isSubmitting, isSubmitted, isSubmitSuccessful, submitCount });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted", data);
  };

  const onError = (errors: FieldErrors<FormValues>) => {
    console.log("Form errors", errors);
  };

  const onReset = () => {
    reset();
  };

  const handleGetValues = () => {
    console.log("Get values", getValues("username"));
  };

  const handleSetValue = () => {
    setValue("username", "", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  renderCount++;
  return (
    <div>
      <h1>YouTube Form ({renderCount / 2})</h1>

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="form-control">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" {...register("username")} />
          <p className="error">{errors.username?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" {...register("email")} />
          <p className="error">{errors.email?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="channel">Channel</label>
          <input type="text" id="channel" {...register("channel")} />
          <p className="error">{errors.channel?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="address-line1">Address Line 1</label>
          <input
            type="text"
            id="address-line1"
            {...register("address.line1")}
          />
          <p className="error">{errors.address?.line1?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="address-line2">Address Line 2</label>
          <input
            type="text"
            id="address-line2"
            {...register("address.line2")}
            disabled={watch("address.line1") === ""}
          />
          <p className="error">{errors.address?.line2?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="age">Age</label>
          <input type="number" id="age" {...register("age")} />
          <p className="error">{errors.age?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="dob">Date of Birth</label>
          <input type="date" id="dob" {...register("dob")} />
          <p className="error">{errors.dob?.message}</p>
        </div>

        <div>
          <label>List of phone numbers</label>
          <div>
            {fields.map((field, index) => (
              <div className="form-control" key={field.id}>
                <input
                  type="text"
                  {...register(`phone.${index}.number` as const)}
                />

                {index > 0 && (
                  <button type="button" onClick={() => remove(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => append({ number: "" })}>
              Add phone number
            </button>
          </div>
        </div>

        <button type="button" onClick={handleGetValues}>
          Get values
        </button>
        <button type="button" onClick={handleSetValue}>
          Set value
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
        <button type="button" onClick={() => trigger("channel")}>
          Validate channel
        </button>
        <button disabled={!isDirty || !isValid}>Submit</button>
      </form>

      <DevTool control={control} />
    </div>
  );
};
