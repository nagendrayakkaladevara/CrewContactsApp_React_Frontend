import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { FixedSizeList as List } from "react-window";
import "./App.css";
import { Input } from "./components/ui/input";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { PhoneIcon } from "lucide-react";

interface User {
  id: number;
  FirstName: string;
  Phone: number;
}

const App: React.FC = () => {
  const [userData, setUserData] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<User[]>([]); 

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
    return userData.filter((user) =>
      user.FirstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, userData]);

  useEffect(() => {
    setFilteredSuggestions(filteredSuggestionsMemo);
  }, [filteredSuggestionsMemo]);

  return (
    <div className="h-[50rem] w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="flex flex-col gap-2" style={{ width: "80%" }}>
        <div>
          <Input
            type="text"
            placeholder="Search user..."
            onChange={handleInputChange}
            className="p-2 border dark:border-white rounded dark:text-white" // Ensure visibility of input
          />
        </div>
        {filteredSuggestions.length > 0 && (
          <SuggestionList suggestions={filteredSuggestions} />
        )}
      </div>
    </div>
  );
};

interface SuggestionListProps {
  suggestions: User[];
}

const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions }) => {
  return (
    <List
      height={400}
      itemCount={suggestions.length}
      itemSize={35}
      width="100%" 
    >
      {({ index }: any) => (
        <div key={suggestions[index].id} className="m-2">
          <div className="m-2">
            <Alert>
            <PhoneIcon className="h-4 w-4" />
              <AlertTitle>{suggestions[index]?.FirstName || "No Name"}</AlertTitle>
              <AlertDescription>
                {suggestions[index]?.Phone || "No Phone"}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </List>
  );
};

export default App;
