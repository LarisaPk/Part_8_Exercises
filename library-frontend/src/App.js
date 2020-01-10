import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Recommend from './components/Recommend'
import LoginForm from './components/LoginForm'
import { gql } from 'apollo-boost'
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/react-hooks'

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      published 
      genres
    }
  }
`
const CURRENT_USER = gql`
{
  me  {
    username
    favoriteGenre
  }
}
`
const FIND_BY_GENRE = gql`
  query getRecommendations($genre: String!) {
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
const ALL_AUTHORS = gql`
{
  allAuthors  {
    name
    born
    bookCount
  }
}
`
const ALL_BOOKS = gql`
{
  allBooks  {
    title
    published
    genres
    author{
      name
      born
      id
    }
  }
}
`
const CREATE_BOOK = gql`
  mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!) {
    addBook(
      title: $title,
      published: $published,
      author: $author,
      genres: $genres
    ) {
      title
      published
      genres 
    }
  }
`
const SET_BIRTHYEAR = gql`
  mutation setBirthyear($name: String!, $born: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $born,
    ) {
      name
      born 
    }
  }
`
const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`
const App = () => {
  const client = useApolloClient()
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const [genre, setGenre] = useState('')
  const [filtered, setFiltered] = useState(null)

//on the first render 
  useEffect(() => {
   const checktoken = localStorage.getItem('library-user-token')
   if (checktoken!==null){
    setToken(checktoken)
   }
  },[])

//if there is a token
  useEffect(() => {
      if (token){
        const findUser = async () => {
            const { data } = await client.query({
              query: CURRENT_USER,
            })
            setGenre(data.me.favoriteGenre)
            console.log('effect genre', data.me.favoriteGenre) 
          }  
        findUser()
      }   
   },[client, token])

  const handleError = (error) => {
    console.log(error)
    setErrorMessage(error.message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData)
      window.alert(`book ${subscriptionData.data.bookAdded.title} added`)
    }
  })

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)

  const [addBook] = useMutation(CREATE_BOOK, {
    onError: handleError,
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS },
      {
        query: gql`
        query getRecomAgain($genre: String!) {
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
        `,
        variables: { genre: genre },
       }]
  })

  const [editAuthor] = useMutation(SET_BIRTHYEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const [login] = useMutation(LOGIN, {
    onError: handleError
  })

  const logout = ()=> {
      setToken(null)
      localStorage.clear()
      client.resetStore()
      setPage('authors')
  }

  const handleReccomendations = async (genre)=> {
      const result = await client.query({
        query: FIND_BY_GENRE,
        variables: { genre: genre }
      })
      setFiltered(result)
      console.log('recommended books', result)
    setPage('recommend')
}
  const errorNotification = () => errorMessage &&
  <div style={{ color: 'red' }}>
    {errorMessage}
  </div>



  return (
    <div> 
      {errorNotification()}       
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token!==null? 
        <button onClick={() => setPage('add')}>add book</button>
        :<></>}
        {token!==null? 
       <button onClick={() => handleReccomendations(genre)}>recommend</button>
        :<></>}        
        {token===null? 
          <button onClick={() => setPage('login')}>login</button>
        : <button onClick={() => logout()}>logout</button>}       
      </div>

      <Authors
       result={authors} show={page === 'authors'} editAuthor={editAuthor} token={token}
      />

      <Books
        show={page === 'books'} allBooks={books}
      />

      <NewBook
        show={page === 'add'} addBook={addBook}
      />

      <LoginForm
        show={page === 'login'} login={login}
        setToken={(token) => setToken(token)}
        setPage={(page) => setPage(page)} 
      />
      <Recommend
        show={page === 'recommend'} token={token} result={filtered} genre={genre}
      />
    </div>
  )
}

export default App