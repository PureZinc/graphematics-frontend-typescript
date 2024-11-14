import { GraphData, EditingState } from "../components/GraphCanvas/Objects";
import { GraphEditor } from "../components/GraphCanvas/GraphCanvas";
import { GraphRetrieveResponse } from './GraphPage';
import { useState, useEffect } from "react"
import useFetch from "../services/UseFetch";
import { BASE_URL } from "../config";
import { useParams } from "react-router-dom";


type PerformModalType = {
    performType: 'class' | 'function',
    openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>],
    graphState: [GraphData | {}, React.Dispatch<React.SetStateAction<GraphData | {}>>]
}
const GraphPerformModal = ({performType, openState, graphState}: PerformModalType) => {
    const [open, setOpen] = openState;
    const [graph, setGraph] = graphState;

    const [data, setData] = useState({
        perform: "",
        params: "",
    })
    type Choices = {available: string[]}
    const { data: choices } = useFetch<Choices>(`/perform/${performType}/`);

    const handleSubmit = async () => {
        const updatedData = {
          ...data,
          params: performType === "function" ? null : data.params,
          graphData: graph
        };
        const res = await fetch(`${BASE_URL}/perform/${performType}/`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(updatedData),
        })
        const returnGraph: GraphData = await res.json();
        setGraph(returnGraph);
        setOpen(false);
      };

    return (
        <div>
          {/* Modal */}
          {open && (
            <div className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Class Selection</h3>
    
                <form>
                  {/* Dropdown for class selection */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Select Class</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={data.perform}
                      onChange={(e) =>
                        setData({ ...data, perform: e.target.value })
                      }
                    >
                      <option value="" disabled>
                        Choose a {performType}
                      </option>
                      {choices?.available &&
                        choices.available.map((cls, index) => (
                          <option key={index} value={cls}>
                            {cls}
                          </option>
                        ))}
                    </select>
                  </div>
    
                  {/* Input for params */}
                  {performType === "class" && (
                    <div className="form-control mt-4">
                      <label className="label">
                        <span className="label-text">Params</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={data.params}
                        onChange={(e) =>
                          setData({ ...data, params: e.target.value })
                        }
                      />
                    </div>
                  )}
                  

                </form>
    
                {/* Modal actions */}
                <div className="modal-action">
                  <button className="btn btn-success" onClick={handleSubmit}>
                    Save
                  </button>
                  <button className="btn" onClick={() => setOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
}

export default function BuildGraph() {
    const { id: graphId } = useParams();
    const search = graphId ? graphId : 0;

    const [graph, setGraph] = useState({});
    const { data: gData, error: fetchError } = useFetch<GraphRetrieveResponse>(`/graphs/${search}/`);
    useEffect(() => {
        if (fetchError) {
            setGraph({});
        } else if (gData) {
            setGraph(gData.data);
        }
    }, [gData, fetchError]);

    const editingStates: EditingState[] = ['add_vertex', 'add_edge', 'move_vertex', 'delete'];
    const [currentState, setCurrentState] = useState<EditingState>('add_vertex');

    const [openClassModal, setOpenClassModal] = useState(false);
    const [openFunctionModal, setOpenFunctionModal] = useState(false);

  return (
    <div className="p-6 bg-base-200 rounded-lg shadow-lg flex flex-col justify-center">
        <p className="text-lg font-bold mb-4 text-center">Build Graph</p>

        {/* Graph Canvas */}
        <div className="mb-6 flex justify-center">
            <GraphEditor dimensions={[500, 400]} graphData={graph} currentState={currentState} />
        </div>

        {/* State Buttons */}
        <div className="flex flex-wrap justify-center space-x-2">
            {editingStates.map((state, index) => (
                <button 
                    className={`btn mb-2 ${state === currentState ? 'btn-primary' : ''}`}
                    onClick={() => setCurrentState(state)} 
                    key={index}
                >
                    {state}
                </button>
            ))}
        </div>

        {/* Functional Buttons */}
        <div className="flex flex-wrap justify-center space-x-2">
            <button className="btn mb-2 btn-secondary"
            onClick={() => setOpenClassModal(true)}>
                Import Class                
            </button>
            <button className="btn mb-2 btn-secondary"
            onClick={() => setOpenFunctionModal(true)}>
                Graph Functions                
            </button>
        </div>
        <GraphPerformModal 
          performType="class" 
          openState={[openClassModal, setOpenClassModal]} 
          graphState={[graph, setGraph]} 
        />
        <GraphPerformModal 
          performType="function" 
          openState={[openFunctionModal, setOpenFunctionModal]} 
          graphState={[graph, setGraph]} 
        />
    </div>
  )
}
