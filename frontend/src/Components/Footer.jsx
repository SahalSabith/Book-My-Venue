export default function Footer() {


return (

<footer className="border-t border-gray-100 py-6 px-6 lg:px-8">

<div className="
max-w-6xl 
mx-auto 
flex 
flex-col 
sm:flex-row 
items-center 
justify-between 
gap-3
">


<span className="text-sm font-medium text-gray-700">
BookMyVenue
</span>



<p className="text-xs text-gray-400">
© 2026 BookMyVenue · Made in Kerala
</p>



<div className="flex gap-5">


{["Privacy","Terms","Contact"].map((item)=>(

<a
key={item}
href="#"
className="
text-xs 
text-gray-400 
hover:text-gray-700 
transition-colors
"
>

{item}

</a>

))}


</div>


</div>


</footer>


)

}