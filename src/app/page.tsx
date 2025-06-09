import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <Button>Action</Button>
      <Button variant={"outline"}>Action</Button>
      <Button variant={"secondary"}>Action</Button>
      <Button variant={"ghost"}>Action</Button>
      <Button variant={"link"}>Action</Button>
    </div>
  );
}
