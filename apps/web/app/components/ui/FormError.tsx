export type FormErrorProps = {
  message: string | null;
};

const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <p role="alert" aria-live="assertive" className="text-center text-sm text-[#F2637A]">
      {message}
    </p>
  );
};

export default FormError;
