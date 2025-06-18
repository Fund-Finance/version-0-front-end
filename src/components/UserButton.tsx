"use client";

interface UserButtonProps {
  children: string;
  width?: string;
}

const UserButton = ({ children, width = "" }: UserButtonProps) => {
  return (
    <button
      className={
        "bg-blue-500 text-white " +
        width +
        " px-4 py-2 rounded hover:bg-blue-600"
      }
    >
      {children}
    </button>
  );
};

export default UserButton;
