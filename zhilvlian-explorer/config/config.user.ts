
const ENV = process.env.UMI_ENV

const serverUser = {
    devbuild: {
        user: '0xsksta91e425813dbbfe97b0f8b7ce743e78899af',
        password: 'user1pw2267dd2d4f546a484',
        network: 'yilvtong-network',
    },
    testbuild: {
        user: '0xsksta91e425813dbbfe97b0f8b7ce743e78899af',
        password: 'user1pw2267dd2d4f546a484',
        network: 'yilvtong-network',
    },
    canarybuild: {
        user: '0xsksta91e425813dbbfe97b0f8b7ce743e78899af',
        password: 'user1pw2267dd2d4f546a484',
        network: 'yilvtong-network',
    },
    prodbuild: {
        user: '0xsksta91e425813dbbfe97b0f8b7ce743e78899af',
        password: 'user1pwdcfaed3efedefac3681a',
        network: 'yilvtong-network',
    }
}

export default serverUser[ENV == 'local' ? 'devbuild' : ENV as any]
