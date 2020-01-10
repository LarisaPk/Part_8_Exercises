import React from 'react'

const Recommend = ({show, result, genre}) => {

  if (!show) {
    return null
  }
  if (result.loading) {
    return <div>loading...</div>
  }
  
  return (
    <div>
      <h2>recommendations</h2>
      books in your favorite genre <strong>{genre}</strong>
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
    </div>
  )
}

export default Recommend