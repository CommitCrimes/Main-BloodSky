import React, { useState } from 'react'

const SearchBar = () => {
   const [input, setInput] = useState();

   const filterSearchedContent = () => {

   }

  const submitSearch = (e : React.FormEvent) => {
    e.preventDefault();
    console.log(input)
    console.log(e)
    //requette api pour recup les data
    //recup res
    //classe via le filtre et la disposition (A a Z)

  }
  return (
      <form className='w-full' onSubmit={(searchedInput)=>{submitSearch(searchedInput)}}>
        <div className='flex flex-col items-center w-full p-2 border-2 border-solid border-black rounded-xl '>
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

            <div>
                <select name="filterOption" id="filterOption">
                    <option value="">Option de filtrage</option>
                    <option value="dog">A a Z</option>
                    <option value="cat">Z a A</option>
                    <option value="hamster">numero de livraison croissant</option>
                    <option value="parrot">numero de livraison croissant</option>
                    <option value="spider">Date Recent / Vieux</option>
                    <option value="goldfish">Goldfish</option>
                </select>
            </div>

        </div>
      </form>
  )
}

export default SearchBar