import { useEffect, useMemo, useState, useRef } from "react";
import debounce from "lodash.debounce";
import { FixedSizeList as List } from "react-window";
import "./App.css";
import { Input } from "./components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons";
import Logo from '../public/indian-railways-logo.png';
import Footer from "./components/ui/footer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";

interface User {
  id: number;
  FirstName: string;
  Phone: number;
}

const App: React.FC = () => {
  const [userData, setUserData] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<User[]>([]);

  const listRef = useRef<any>(null);

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data: { data: User[] }) => setUserData(data.data))
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const filteredSuggestionsMemo = useMemo(() => {
    if (!searchTerm) return [];

    const normalizedSearchTerm = searchTerm.toLowerCase().replace(/[^a-z]/g, "");

    return userData.filter((user) => {
      const normalizedFirstName = user.FirstName?.toLowerCase().replace(/[^a-z]/g, "");

      return normalizedFirstName.includes(normalizedSearchTerm);
    });
  }, [searchTerm, userData]);

  useEffect(() => {
    setFilteredSuggestions(filteredSuggestionsMemo);

    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  }, [filteredSuggestionsMemo]);

  return (
    <>
      <div className="h-screen w-full dark:bg-black bg-white dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="flex flex-col gap-2" style={{ width: "80%" }}>
          <div className="flex justify-center w-full">
            <img src={Logo} className="h-16 w-16 " />
          </div>
          <div>
            <Input
              type="text"
              placeholder="Search user..."
              onChange={handleInputChange}
              className="p-2 border dark:border-white rounded dark:text-white text-black border-white dark:bg-black bg-white"
            />
          </div>
          {filteredSuggestions.length > 0 && (
            <SuggestionList suggestions={filteredSuggestions} listRef={listRef} />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

interface SuggestionListProps {
  suggestions: User[];
  listRef: React.Ref<any>;
}

const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions, listRef }) => {
  const handleClickCall = (number: any) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <List
      ref={listRef}
      height={400}
      itemCount={suggestions.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }: any) => (
        <div key={suggestions[index].id} style={{ ...style }} className="">
          <Alert>
            <RocketIcon className="h-4 w-4" />
            <AlertTitle >{suggestions[index]?.FirstName || "No Name"}</AlertTitle>
            <AlertDescription className="flex justify-between">
              {suggestions[index]?.Phone || "No Phone"}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="inline-flex h-8 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-5 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                      onClick={() => handleClickCall(suggestions[index]?.Phone)}
                    >
                      Call
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </AlertDescription>
          </Alert>
        </div>
      )}
    </List>
  );
};

export default App;
