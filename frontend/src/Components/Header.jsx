import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";


function ModeSwitch({ mode, onChange, fullWidth = false }) {

  return (

    <div
      className={`flex items-center bg-gray-100 rounded-full p-1 font-medium select-none ${
        fullWidth ? "w-full" : ""
      }`}
    >

      <button
        onClick={() => onChange("book")}
        className={`flex-1 px-5 py-2 rounded-full transition-all duration-200 text-sm ${
          mode === "book"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Book a Venue
      </button>



      <button
        onClick={() => onChange("rent")}
        className={`flex-1 px-5 py-2 rounded-full transition-all duration-200 text-sm ${
          mode === "rent"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        List My Venue
      </button>


    </div>

  );

}





export default function Header(){

const [mode,setMode] = useState("book");
const [menuOpen,setMenuOpen] = useState(false);
const [profileOpen,setProfileOpen] = useState(false);

const [ownerModal,setOwnerModal] = useState(false);
const [readMore,setReadMore] = useState(false);


const profileRef = useRef(null);

const navigate = useNavigate();


const token = useSelector(
    (state)=>state.auth.token
);

const isLoggedIn = !!token;



useEffect(()=>{

const handler = (e)=>{

if(profileRef.current && 
!profileRef.current.contains(e.target)){

setProfileOpen(false);

}

}


document.addEventListener(
"mousedown",
handler
);


return ()=> 
document.removeEventListener(
"mousedown",
handler
);


},[]);





const handleOwnerSubmit = (e)=>{

e.preventDefault();

setOwnerModal(false);

navigate("/venue-owner");

}







return (

<>


<nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">

<div 
className="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between gap-6"
style={{height:"68px"}}
>



{/* logo */}

<Link 
to="/"
className="flex items-center gap-2.5"
>


<div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">


<svg width="16" height="16" viewBox="0 0 12 12">

<rect x="1" y="1" width="4" height="4" fill="white"/>
<rect x="7" y="1" width="4" height="4" fill="white" opacity=".6"/>
<rect x="1" y="7" width="4" height="4" fill="white" opacity=".6"/>
<rect x="7" y="7" width="4" height="4" fill="white" opacity=".3"/>

</svg>


</div>


<span className="font-bold">
BookMyVenue
</span>


</Link>





<div className="hidden md:flex gap-8 text-sm text-gray-500">

<a href="#venues">
Browse
</a>

<a href="#how">
How It Works
</a>

</div>






<div className="hidden md:flex items-center gap-3">


{isLoggedIn ? (

<>


<ModeSwitch 
mode={mode}
onChange={(value)=>{

if(value==="rent"){
setOwnerModal(true);
}

setMode(value);

}}
/>



<div 
ref={profileRef}
className="relative"
>


<button
onClick={()=>setProfileOpen(!profileOpen)}
className="
flex items-center gap-2 
bg-gray-100 
border 
rounded-full
px-3 py-2
text-sm
"
>

<div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">
AJ
</div>

Arjun

</button>





{profileOpen && (


<div className="
absolute right-0 mt-3
w-56
bg-white
border
rounded-xl
shadow-lg
p-2
">


<p className="font-semibold px-3 py-2">
Arjun Jayakumar
</p>



<button className="block w-full text-left px-3 py-2 hover:bg-gray-50">
My bookings
</button>


<button className="block w-full text-left px-3 py-2 hover:bg-gray-50">
Saved venues
</button>


<button className="block w-full text-left px-3 py-2 text-red-500 hover:bg-red-50">
Sign out
</button>



</div>


)}



</div>


</>


):(


<>


<Link to="/login">
Login
</Link>


<Link
to="/register"
className="bg-gray-900 text-white px-5 py-2 rounded-lg"
>
Sign up free
</Link>



</>


)}



</div>


</div>


</nav>






{/* VENUE OWNER MODAL */}



{ownerModal && (


<div className="
fixed inset-0 
bg-black/40 
z-[100]
flex justify-center items-center
">



<form
onSubmit={handleOwnerSubmit}
className="
bg-white 
rounded-2xl
w-[420px]
p-7
shadow-xl
"
>



<h2 className="text-xl font-bold mb-5">
Register Your Business
</h2>



<input
className="w-full border rounded-lg p-3 mb-3"
placeholder="Business Name"
/>


<input
className="w-full border rounded-lg p-3 mb-3"
placeholder="Business Email"
/>



<input
className="w-full border rounded-lg p-3 mb-3"
placeholder="Business Phone"
/>



<label className="flex gap-2 text-sm">

<input 
type="checkbox"
required
/>

Accept terms and conditions

</label>




<button
type="button"
onClick={()=>setReadMore(!readMore)}
className="text-blue-500 text-sm mt-2"
>
Read More
</button>



{readMore && (

<p className="text-gray-500 text-sm mt-2">

Dummy terms:
Venue details must be correct.
Bookings and approvals are handled by BookMyVenue.

</p>

)}

<div className="flex gap-3 mt-5">


<button
type="button"
onClick={() => setOwnerModal(false)}
className="
flex-1
border
border-gray-200
text-gray-700
py-3
rounded-lg
hover:bg-gray-50
transition
"
>

Cancel

</button>




<button
type="submit"
className="
flex-1
bg-gray-900
text-white
py-3
rounded-lg
hover:bg-gray-700
transition
"
>

Submit

</button>


</div>



</form>


</div>


)}



</>

)


}