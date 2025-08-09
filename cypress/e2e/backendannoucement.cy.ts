/// <reference types="cypress" />

type Announcement = {
  id: string
  title: string
  content: string
  image: unknown[]
  tags: unknown[]
  createdAt: string
  updatedAt: string
}

const api = () => Cypress.env('BACKEND_URL') as string

function buildMultipartBody(fields: Record<string, string>) {
  const BOUNDARY = '----CypressFormBoundary' + Date.now()
  const parts = Object.entries(fields)
    .map(
      ([name, value]) =>
        `--${BOUNDARY}\r\n` +
        `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
        `${value}\r\n`
    )
    .join('')
  const closing = `--${BOUNDARY}--\r\n`
  return {
    headers: { 'Content-Type': `multipart/form-data; boundary=${BOUNDARY}` },
    body: parts + closing,
  }
}

describe('/announcements API', () => {
  let createdId: string

  it('GET /announcements', () => {
    cy.request<Announcement[]>(`${api()}/announcements`).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body: ${JSON.stringify(res.body)}`)
      console.log('GET /announcements response:', res)

      expect(res.status).to.eq(200)
      expect(res.body).to.be.an('array')
    })
  })

  it('POST /announcements - สร้าง (multipart/form-data)', () => {
    const { headers, body } = buildMultipartBody({ title: 'test', content: 'test' })

    cy.request<Announcement>({
      method: 'POST',
      url: `${api()}/announcements`,
      headers,
      body,
    }).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body: ${JSON.stringify(res.body)}`)
      console.log('POST /announcements response:', res)

      expect([200, 201]).to.include(res.status)
      expect(res.body).to.have.keys(
        'id',
        'title',
        'content',
        'image',
        'tags',
        'createdAt',
        'updatedAt'
      )
      createdId = res.body.id
    })
  })

  it('GET /announcements/:id', () => {
    cy.request<Announcement>(`${api()}/announcements/${createdId}`).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body: ${JSON.stringify(res.body)}`)
      console.log(`GET /announcements/${createdId} response:`, res)

      expect(res.status).to.eq(200)
      expect(res.body.id).to.eq(createdId)
    })
  })

  it('GET /announcements (check in list)', () => {
    cy.request<Announcement[]>(`${api()}/announcements`).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body: ${JSON.stringify(res.body)}`)
      console.log('GET /announcements list after create:', res)

      const found = res.body.find((a) => a.id === createdId)
      expect(found, 'created item present in list').to.exist
    })
  })

  it('DELETE /announcements', () => {
    cy.request<{ message?: string }>({
      method: 'DELETE',
      url: `${api()}/announcements`,
      body: { id: createdId },
    }).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body: ${JSON.stringify(res.body)}`)
      console.log('DELETE /announcements response:', res)

      expect([200, 204]).to.include(res.status)
    })
  })

  it('GET /announcements/:id - after delete', () => {
    cy.request({
      method: 'GET',
      url: `${api()}/announcements/${createdId}`,
      failOnStatusCode: false,
    }).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body: ${JSON.stringify(res.body)}`)
      console.log(`GET /announcements/${createdId} after delete:`, res)

      expect([404, 410, 204]).to.include(res.status)
    })
  })
})
