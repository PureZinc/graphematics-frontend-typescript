import useFetch from '../services/UseFetch';
import { useParams } from 'react-router-dom';
import { GraphDisplay } from "../components/GraphCanvas/GraphCanvas";
import { Link } from "react-router-dom";
import { GraphRetrieveResponse } from './GraphPage';

export default function GraphDetail() {
    const { id } = useParams();
    const {data: graph, loading, error} = useFetch<GraphRetrieveResponse>(`/graphs/${id}/`);
    // const {data: user, loading: loadUser} = useFetch(`/auth/users/${loading ? '' : graph.creator}`);

    if (loading) return <div>Loading...</div>;

    if (error) return <div>Error: {error}</div>;
    
    if (!graph) {
        return <div>No graph was found.</div>;
    }

    const numVertices = Object.keys(graph.data).length;
    const numEdges = Object.values(graph.data)
        .map((g) => g.neighbors.length)
        .reduce((acc, edges) => acc + edges, 0) / 2

  return (
    <div className="container mx-auto mt-4">
        <h1 className="mb-4 text-2xl font-bold">{ graph.name } Details</h1>
        <div className="flex flex-wrap justify-center text-center">

            <div className="w-full md:w-2/3 mb-4">
                <div className="card shadow-lg mb-4 bg-base-100">
                    <div className="card-header p-4">
                        <h5 className="card-title text-xl font-semibold">{ graph.name }</h5>
                    </div>
                    <div className="card-body">
                        <GraphDisplay graphData={graph.data} />
                    </div>
                    <div className="card-footer p-4">
                        <Link to={`/create/${graph.id}`}><button className="btn">Edit Graph</button></Link>
                    </div>
                </div>
            </div>

            {/* <!-- Graph Information --> */}
            <div className="w-full md:w-1/3 mb-4">
                <div className="card shadow-lg mb-4 bg-base-100">
                    <div className="card-header p-4">
                        <h5 className="card-title text-xl font-semibold">Graph Information</h5>
                    </div>
                    <div className="card-body p-4">
                        <ul className="list-group list-none space-y-2">
                            {/* <li className="list-group-item"><strong>Creator:</strong> { loadUser ? 'Loading...' : user.username }</li> */}
                            <li className="list-group-item"><strong>Vertices:</strong> { numVertices }</li>
                            <li className="list-group-item"><strong>Edges:</strong> { numEdges }</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    </div>
  )
}