import React, { useState, useEffect } from 'react'
import { gql } from 'apollo-boost'
import { useApolloClient } from '@apollo/react-hooks'

const FILTER_BOOKS = gql`
  query getBooks ($genre: String!) {
    allBooks(genre: $genre) {
      title
      published 
      genres
      author {
        name
        born
      }
    }
  }
`
const Books = ({show, allBooks}) => {
  const client = useApolloClient()
  const [filter, setFilter] = useState('all')
  const [result, setResult] = useState(null)

  useEffect(() => {
      setResult(allBooks)
      console.log('effect all books')
   },[allBooks])

  const booksFiltered = async (filter) => {
    setFilter(filter)
    const result = await client.query({
      query: FILTER_BOOKS,
      variables: { genre: filter }
    })
    setResult(result)
    console.log('filtered books', result)
  }
const all = ()=>{
  setResult(allBooks)
  setFilter('all')
}

  if (!show) {
    return null
  }
  if (result.loading) {
    return <div>loading...</div>
  }
  
  const allGenres = allBooks.data.allBooks.map(book => book.genres) 
  const combinedGenres = allGenres.reduce(( allgenres, currentgenre) => allgenres.concat(currentgenre),
  []
  )
  
  const setOfGenres = [...new Set(combinedGenres)]
  console.log(setOfGenres) 

  return (
    <div>
      <h2>books</h2>
      in genre <strong>{filter}</strong>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {result.data.allBooks
          .map(book =>
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
      {setOfGenres.map(g =>
            <button onClick={()=>booksFiltered(g)} key={g}>{g}</button>
          )}
       <button onClick={()=>all()}>all genres</button>    
      </div>
    </div>
  )
}

export default Books