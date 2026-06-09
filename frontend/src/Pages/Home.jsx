import Header from "../Components/Header";
import Footer from "../Components/Footer";


const venues = [
{
id:1,
name:"The Grand Atrium",
type:"Auditorium",
location:"Thiruvananthapuram",
price:"₹8,500",
capacity:"500 guests",
image:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80"
},

{
id:2,
name:"Brew & Co. Café",
type:"Café Space",
location:"Kochi",
price:"₹1,200",
capacity:"30 guests",
image:"https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80"
},

{
id:3,
name:"Canvas Studio",
type:"Creative Studio",
location:"Kozhikode",
price:"₹2,500",
capacity:"20 guests",
image:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80"
}
];





export default function Home(){


return (

<div
className="min-h-screen bg-white text-gray-900"
style={{
fontFamily:
"'DM Sans','Helvetica Neue',sans-serif"
}}
>


<Header/>





{/* HERO */}


<section className="pt-32 pb-20 px-6 lg:px-8">


<div className="max-w-6xl mx-auto">


<div className="max-w-xl">


<p className="
text-xs 
font-medium 
text-gray-400 
tracking-widest 
uppercase 
mb-5
">
Kerala's venue marketplace
</p>



<h1 
className="
text-4xl 
md:text-5xl 
font-bold 
leading-tight 
mb-5
"
>

Find the right space
<br/>
for your next event

</h1>



<p className="
text-gray-500 
text-base 
leading-relaxed 
mb-8
max-w-sm
">

Cafés, auditoriums, banquet halls, studios —
browse and book instantly across Kerala.

</p>



<div className="flex gap-2 max-w-md">


<input
placeholder="City or venue name..."
className="
flex-1
border
rounded-lg
px-4
py-2.5
text-sm
"
/>



<button className="
bg-gray-900
text-white
px-5
rounded-lg
text-sm
">

Search

</button>


</div>





<div className="flex gap-8 mt-10">


{[
["250+","Venues"],
["12K+","Bookings"],
["4.8","Rating"]
].map(([num,label])=>(


<div key={label}>


<div className="font-bold">
{num}
</div>


<div className="text-xs text-gray-400">
{label}
</div>


</div>


))}


</div>



</div>


</div>


</section>







{/* VENUES */}


<section 
id="venues"
className="
py-16 
px-6 
lg:px-8 
bg-gray-50
"
>


<div className="max-w-6xl mx-auto">


<div className="flex justify-between mb-8">


<div>

<p className="
text-xs
uppercase
tracking-widest
text-gray-400
">
Featured
</p>


<h2 className="text-2xl font-bold">
Popular venues
</h2>


</div>



<button className="text-gray-500 text-sm">
View all →
</button>


</div>





<div className="
grid 
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
gap-4
">


{venues.map((v)=>(


<div
key={v.id}
className="
bg-white
rounded-xl
overflow-hidden
border
hover:shadow-md
transition
"
>


<img
src={v.image}
className="
h-44
w-full
object-cover
"
/>



<div className="p-4">


<span className="
text-xs
text-gray-500
">

{v.type}

</span>



<h3 className="font-semibold mt-1">
{v.name}
</h3>



<p className="text-xs text-gray-400">
{v.location}
</p>



<div className="
flex
justify-between
items-center
mt-4
">


<p className="font-bold">
{v.price}
<span className="text-xs text-gray-400">
 /hr
</span>
</p>



<button className="
border
rounded-lg
px-3
py-1
text-sm
hover:bg-gray-900
hover:text-white
">

Book

</button>



</div>


</div>


</div>


))}


</div>


</div>


</section>








{/* HOW IT WORKS */}


<section 
id="how"
className="py-16 px-6"
>


<div className="max-w-6xl mx-auto text-center">


<h2 className="text-2xl font-bold mb-10">
Book in 3 steps
</h2>



<div className="
grid
md:grid-cols-3
gap-6
">


{[
"Search venues",
"Pick a slot",
"Confirm booking"
].map((item,i)=>(


<div
key={item}
className="
p-6
rounded-xl
bg-gray-50
border
"
>


<div className="
mx-auto
mb-4
bg-gray-900
text-white
rounded-full
w-7
h-7
flex
items-center
justify-center
">

{i+1}

</div>


{item}


</div>


))}



</div>


</div>


</section>







{/* CTA */}


<section className="
py-16
bg-gray-900
text-center
">


<h2 className="
text-white
text-2xl
font-bold
">

Ready to get started?

</h2>


<p className="text-gray-400 mt-3">

Join thousands of event planners.

</p>


</section>





<Footer/>


</div>


)

}