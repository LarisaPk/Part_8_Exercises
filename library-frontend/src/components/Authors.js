import React, { useState } from 'react'

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  
  const handleChange = (e) => {
    e.preventDefault()
    setName(e.target.value)
  }
  const submit = async (e) => {
    e.preventDefault()

    await props.editAuthor({
      variables: { name, born }
    })
    setBorn('')
    setName('')
  }
  
  if (!props.show) {
    return null
  }
  if (props.result.loading) {
    return <div>loading...</div>
  }
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {props.result.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
     

      {props.token?
      <form onSubmit={submit}>
        <h3>Set birthyear</h3>
          <select value={name} onChange={handleChange} >
            <option>Select author</option>
           {props.result.data.allAuthors.map(a =>
             <option key={a.name} value={a.name}>{a.name}</option>
          )}
          </select>
          <div>
            born <input
              value={born}
              onChange={({ target }) => setBorn(parseInt(target.value))}
            />
          </div>
          <button type='submit'>update author</button>
        </form>
         : <></>}
    </div>
  )
}

export default Authors