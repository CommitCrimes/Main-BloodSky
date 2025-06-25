import React, { useState } from 'react'

const SearchBar = () => {
   const [input, setInput] = useState();
   const [searchResult, setSearchResult] = useState("");

   const filterSearchedContent = (filterParam) => {
    // orderBy filterParam
    const filteredSearch = ""
    setSearchResult(filteredSearch)
   }

  const submitSearch = (e : React.FormEvent) => {
    e.preventDefault();
    console.log(input)
    console.log(e)
    
    // requette api pour recup les data
    // recup res
    // classe via le filtre
    // filterSearchedContent()
  }
  return (
      <form className='w-full' onSubmit={(searchedInput)=>{submitSearch(searchedInput)}}>
        <div className='flex flex-col items-center w-full p-2 border-2 border-solid border-black rounded-xl relative'>
            <input type="text" className='flex border-black border-2 rounded-full p-2 w-4/6' onChange={(e) => setInput(e.target.value)}/>
            
            <div>
              <fieldset className='flex gap-2'>
                <div>
                  <label htmlFor="Statuts">Statuts</label>
                  <input type="radio" name="filter" id="Statuts" />
                </div>
                <div>
                  <label htmlFor="livraison">Livraison</label>
                  <input type="radio" name="filter" id="livraison" />
                </div>
                <div>
                  <label htmlFor="Urgent">Urgent</label>
                  <input type="radio" name="filter" id="Urgent" />
                </div>
              </fieldset>

            </div>

            <div className='absolute right-0'>
                <select name="filterOption" id="filterOption">
                    <option value="">Option de filtrage</option>
                    <option value="AaZ">A a Z</option>
                    <option value="ZaA">Z a A</option>
                    <option value="croissant">numero de livraison croissant</option>
                    <option value="decroissant">numero de livraison croissant</option>
                    <option value="new">Date Recent / Vieux</option>
                    <option value="old">Date Vieux / Recent</option>
                </select>
            </div>

        </div>
      </form>
  )
}

export default SearchBar