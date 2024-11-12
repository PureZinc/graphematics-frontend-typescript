import { Link } from "react-router-dom"
import { useContext } from "react";
import AuthContext from "../services/Auth";

const Links = ({isAuth}) => {
    return (
        <ul className="menu menu-horizontal px-1">
            <li><Link to="/graphs">Graphs</Link></li>
            <li>
                <details>
                    <summary>Create +</summary>
                    <ul className="bg-base-100 rounded-t-none p-2">
                        <li><Link to="/create">New Graph</Link></li>
                    </ul>
                </details>
            </li>
            {!isAuth && (<li><Link to="/login">Login</Link></li>)}
        </ul>
    )
}

const ProfileDropdown = ({logoutFunction}) => {
    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                <img
                    alt="Graphematics PFP"
                    src="/Petersen.png" />
                </div>
            </div>
            <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                <li><div>Profile</div></li>
                <li><div>Settings</div></li>
                <li><div onClick={() => logoutFunction()}>Logout</div></li>
            </ul>
        </div>
    )
}

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);

  return (
    <div className="navbar bg-base-100 p-3">
        <div className="flex-1">
            <Link to="/" className="btn btn-ghost text-xl">Graphematics</Link>
        </div>
        <div className="flex-none gap-2">

            <Links isAuth={user} />

            {user && <ProfileDropdown logoutFunction={logout}/>}
            
        </div>
    </div>
  )
}