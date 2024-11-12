import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Calling All Graph Theorists!!!</h1>
                    <p className="py-6">
                        Build and Study your own Graphs!
                    </p>
                    <Link to="graphs/"><button className="btn btn-primary">Get Started</button></Link>
                </div>
            </div>
        </div>
    )
}

export default function HomePage() {
  return (
    <main>
        <Hero />
    </main>
  )
}