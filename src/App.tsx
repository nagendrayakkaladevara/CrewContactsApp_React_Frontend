import { useEffect, useMemo, useState, useRef } from "react";
// import debounce from "lodash.debounce";
import { FixedSizeList as List } from "react-window";
import "./App.css";
import { Input } from "./components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PhoneIcon } from "lucide-react";
import Logo from '../public/indian-railways-logo.png';
import Footer from "./components/ui/footer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface User {
  id: number;
  FirstName: string;
  Phone: number;
}

interface VisitorResponse {
  message: string;
  count: number;
}

interface Document {
  _id: string;
  doc_title: string;
  doc_link: string;
  createdAt: string;
  doc_discription: string;
  doc_uploaded_by: string;
  updatedAt: string;
  __v: number;
}

const App: React.FC = () => {
  const [userData, setUserData] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<User[]>([]);
  const [visitors, setVisitors] = useState<VisitorResponse | null>(null);

  const listRef = useRef<any>(null);
  const isFetched = useRef(false);

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data: { data: User[] }) => setUserData(data.data))
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };


  const handleVoiceSearch = () => {
    const recognition = new SpeechRecognition();
    recognition.start();

    recognition.onresult = (event: any) => {
      const spokenWord = event.results[0][0].transcript;
      setSearchTerm(spokenWord);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };
  };

  const filteredSuggestionsMemo = useMemo(() => {
    if (!searchTerm) return [];

    const normalizedSearchTerm = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, "");

    return userData.filter((user) => {
      const normalizedFirstName = user.FirstName?.toLowerCase().replace(/[^a-z0-9]/g, "");
      return normalizedFirstName.includes(normalizedSearchTerm);
    });
  }, [searchTerm, userData]);

  useEffect(() => {
    setFilteredSuggestions(filteredSuggestionsMemo);

    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  }, [filteredSuggestionsMemo]);


  useEffect(() => {
    if (isFetched.current) return;

    const fetchData = async () => {
      try {
        const response = await fetch('https://payment-details-railwayapplication-backend.vercel.app/track-visitor');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setVisitors(data);
        isFetched.current = true;
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTermDoc, setSearchTermDoc] = useState<string>('');
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await axios.get('https://ecorsuexpressapp.vercel.app/docUpload');
        setDocuments(response.data);
        setFilteredDocuments(response.data); // Set initial filter as all documents
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const results = documents.filter((document) =>
      document.doc_title.toLowerCase().includes(searchTermDoc.toLowerCase())
    );
    setFilteredDocuments(results);
  }, [searchTermDoc, documents]);

  return (
    <>
      <div className="h-screen w-full dark:bg-black bg-white dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-start justify-center pt-20">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="flex flex-col gap-2" style={{ width: "80%" }}>
          <div className="flex justify-center w-full">
            <img src={Logo} className="h-16 w-16 " />
          </div>
          <Tabs defaultValue="Contacts" className="w-full flex justify-center flex-col">
            <div className="m-auto pb-3">
              <TabsList>
                <TabsTrigger value="Contacts">Crew Contacts</TabsTrigger>
                <TabsTrigger value="Documents">Important Documents</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="Contacts">
              <div className="flex gap-2 pb-3">
                <Input
                  type="text"
                  placeholder="Search user..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="p-2 border dark:border-white rounded dark:text-white text-black border-black dark:bg-black bg-white"
                />
                <Button onClick={handleVoiceSearch}>🎤 Voice Search</Button>
              </div>
              {filteredSuggestions.length > 0 && (
                <SuggestionList suggestions={filteredSuggestions} listRef={listRef} />
              )}
            </TabsContent>

            <TabsContent value="Documents">
              <div className="pb-3">
                <Input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTermDoc}
                  onChange={(e) => setSearchTermDoc(e.target.value)}
                  className="p-2 border dark:border-white rounded dark:text-white text-black border-black dark:bg-black bg-white"
                />
              </div>
              <ul className="overflow-y-scroll h-80 md:h-96">
                {filteredDocuments.map((doc) => (
                  <li key={doc._id} style={{ marginBottom: '10px' }}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex justify-between">{doc.doc_title} <Button ><a href={doc.doc_link} target="_blank" rel="noopener noreferrer">Open</a></Button></CardTitle>
                      </CardHeader>
                    </Card>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="flex justify-center p-2 pb-1">
        <Button>Visitor count : {visitors?.count}</Button>
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
            <PhoneIcon className="h-4 w-4" />
            <AlertTitle>{suggestions[index]?.FirstName || "No Name"}</AlertTitle>
            <AlertDescription className="flex justify-between">
              {suggestions[index]?.Phone || "No Phone"}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="inline-flex h-8 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white"
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
