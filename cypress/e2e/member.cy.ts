/// <reference types="cypress" />

type Member = {
  id: string
  fullname: string
  code: string
  nickname: string
  imageUrl: string
}

const api = () => Cypress.env('BACKEND_URL') as string

// เอกสารลบสมาชิกใช้ค่าที่หน้าตาเหมือน "code" เป็น path param
// ถ้าโปรดักชันของคุณลบด้วย "id" ให้สลับเป็น false
const DELETE_BY_CODE = true

const expectMemberShape = (m: Member, expected?: Partial<Member>) => {
  expect(m).to.include.all.keys('id', 'fullname', 'code', 'nickname', 'imageUrl')
  if (expected?.fullname) expect(m.fullname).to.eq(expected.fullname)
  if (expected?.code) expect(m.code).to.eq(expected.code)
  if (expected?.nickname) expect(m.nickname).to.eq(expected.nickname)
  if (expected?.imageUrl) expect(m.imageUrl).to.eq(expected.imageUrl)
}

const randomCode = () =>
  String(Math.floor(100_000_000 + Math.random() * 900_000_000)) // 9 หลัก คล้ายตัวอย่าง

describe('/members API', () => {
  let createdId: string
  let createdCode: string

  it('GET /members - ควรคืน array ของสมาชิก', () => {
    cy.request<Member[]>({
      method: 'GET',
      url: `${api()}/members`,
    }).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body: ${JSON.stringify(res.body)}`)
      console.log('GET /members response:', res)

      expect(res.status).to.eq(200)
      expect(res.body).to.be.an('array')
      if (res.body.length) {
        expectMemberShape(res.body[0])
      }
    })
  })

  it('POST /members - เพิ่มสมาชิกใหม่ (JSON)', () => {
    const payload = {
      fullname: 'Apiwit Boonyarit',
      code: randomCode(),
      nickname: 'Tew',
      imageUrl:
        'https://scontent.fcnx1-1.fna.fbcdn.net/v/t39.30808-1/428037908_2113537415673962_4429105966346313423_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=Tx8gvXeFHMwQ7kNvwEr8WkN&_nc_oc=AdkGtwS3YAU4xw3xT5Zd0PL4DSlMzhoYARJ77odZjsgEW3Q8Smt7jL4JjnMalNS8GTc&_nc_zt=24&_nc_ht=scontent.fcnx1-1.fna&_nc_gid=xB_TcESRQsgX-FlwjIozVA&oh=00_AfWpIZ5l8aCPQ0kfAG5r-3Sf2kRLh-LZqr4vBgTjRdtIXg&oe=68976DE4',
    }

    cy.request<{ message: string; data: Member }>({
      method: 'POST',
      url: `${api()}/members`,
      body: payload,
    }).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body: ${JSON.stringify(res.body)}`)
      console.log('POST /members response:', res)

      expect([200, 201]).to.include(res.status)
      expect(res.body).to.have.keys('message', 'data')
      expectMemberShape(res.body.data, payload)
      createdId = res.body.data.id
      createdCode = res.body.data.code
      expect(createdId).to.be.a('string').and.not.empty
    })
  })

  it('GET /members - ต้องพบสมาชิกที่เพิ่งสร้างในลิสต์', () => {
    cy.request<Member[]>({
      method: 'GET',
      url: `${api()}/members`,
    }).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body count: ${res.body.length}`)
      console.log('GET /members list after create:', res)

      const found = res.body.find(
        (m) => m.id === createdId || m.code === createdCode
      )
      expect(found, 'created member present in list').to.exist
      if (found) expectMemberShape(found)
    })
  })

  it('DELETE /members/:id - ลบสมาชิก', () => {
    const key = DELETE_BY_CODE ? createdCode : createdId
    cy.request<{ message?: string; data?: Member }>({
      method: 'DELETE',
      url: `${api()}/members/${key}`,
    }).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body: ${JSON.stringify(res.body)}`)
      console.log('DELETE /members response:', res)

      expect([200, 204]).to.include(res.status)
      if (res.status === 200 && res.body?.message) {
        expect(res.body.message).to.match(/deleted/i)
      }
    })
  })

  it('GET /members - หลังลบต้องไม่พบ', () => {
    cy.request<Member[]>({
      method: 'GET',
      url: `${api()}/members`,
    }).then((res) => {
      cy.log(`Status: ${res.status}`)
      cy.log(`Body count: ${res.body.length}`)
      console.log('GET /members after delete:', res)

      const found = res.body.find(
        (m) => m.id === createdId || m.code === createdCode
      )
      expect(found, 'member should be deleted').to.not.exist
    })
  })
})
