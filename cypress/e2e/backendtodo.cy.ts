/// <reference types="cypress" />

type Todo = {
  id: string
  todoText: string
}

const api = () => Cypress.env('BACKEND_URL') as string

describe('Backend', () => {
  it('checks env', () => {
    cy.log(JSON.stringify(Cypress.env()))
  })

  it('checks CORS disabled', () => {
    cy.request({
      method: 'GET',
      url: `${api()}/todo`,
    }).then((res) => {
      expect(res.headers).to.not.have.property('access-control-allow-origin')
    })
  })

  it('checks get response', () => {
    cy.request<Todo[]>({
      method: 'GET',
      url: `${api()}/todo`,
    }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.be.an('array')
    })
  })

  it('creates todo', () => {
    cy.request<{ msg: string; data: Todo }>({
      method: 'PUT',
      url: `${api()}/todo`,
      body: {
        todoText: 'New Todo',
      },
    }).then((res) => {
      cy.log(JSON.stringify(res.body))
      expect(res.status).to.be.oneOf([200, 201])
      expect(res.body).to.have.all.keys('msg', 'data')
      expect(res.body.data).to.include.all.keys('id', 'todoText')
    })
  })

  it('deletes todo', () => {
    // สร้างก่อนเพื่อได้ id มาลบ
    cy.request<{ msg: string; data: Todo }>({
      method: 'PUT',
      url: `${api()}/todo`,
      body: { todoText: 'New Todo' },
    }).then((createRes) => {
      const todo = createRes.body.data
      cy.request<{ msg: string; data: Pick<Todo, 'id'> }>({
        method: 'DELETE',
        url: `${api()}/todo`,
        body: { id: todo.id },
      }).then((res) => {
        cy.log(JSON.stringify(res.body))
        expect(res.status).to.be.oneOf([200, 204])
        expect(res.body).to.have.all.keys('msg', 'data')
        expect(res.body.data).to.have.all.keys('id')
      })
    })
  })

  it('updates todo', () => {
    // สร้างก่อนเพื่อได้ id มาอัปเดต
    cy.request<{ msg: string; data: Todo }>({
      method: 'PUT',
      url: `${api()}/todo`,
      body: { todoText: 'New Todo' },
    }).then((createRes) => {
      const newTodo = createRes.body.data
      cy.wrap(newTodo.id).as('currentId') // เก็บ id ไว้ใน context

      cy.request<{ msg: string; data: Todo }>({
        method: 'PATCH',
        url: `${api()}/todo`,
        body: {
          id: newTodo.id,
          todoText: 'Updated Text',
        },
      }).then(() => {
        cy.request<Todo[]>({
          method: 'GET',
          url: `${api()}/todo`,
        }).then(function (res) {
          // ใช้ function() เพื่อเข้าถึง this.currentId ได้
          const currentId = this.currentId as string
          const todos = res.body
          const updated = todos.find((el) => el.id === currentId)
          expect(updated, 'todo should exist after update').to.exist
          expect(updated!.todoText).to.equal('Updated Text')
        })
      })
    })
  })
})
