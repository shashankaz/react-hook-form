import { useEffect } from "react";
import { FieldErrors, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DevTool } from "@hookform/devtools";

let renderCount = 0;

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .refine(
      async (email) => {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users?email=${email}`
        );
        const data = await response.json();
        return data.length === 0;
      },
      { message: "Email already exists" }
    )
    .refine((email) => email !== "admin@example.com", {
      message: "Enter a different email address",
    })
    .refine((email) => !email.endsWith("baddomain.com"), {
      message: "This domain is not supported",
    }),
  channel: z.string().min(1, { message: "Channel is required" }),
  address: z.object({
    line1: z.string().min(1, { message: "Address is required" }),
    line2: z.string().optional(),
  }),
  age: z
    .number()
    .min(1, { message: "Age is required" })
    .nonnegative({ message: "Age must be a positive number" }),
  dob: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date({ required_error: "Date of Birth is required" })),
  phone: z.array(
    z.object({
      number: z.string(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

export const ZodYouTubeForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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

  // const watchUsername = watch("username");
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

      {/* <h2>Watched value: {watchUsername}</h2> */}
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
            <button
              type="button"
              onClick={() =>
                append({
                  number: "",
                })
              }
            >
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
