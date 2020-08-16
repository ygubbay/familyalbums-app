export default {
    MAX_ATTACHMENT_SIZE: 10000000,
    s3: {
      REGION: "eu-west-2",
      BUCKET: "ygubbay-photo-albums"
    },
    apiGateway: {
      REGION: "eu-west-2",
      URL: "https://lmhmbqhl6c.execute-api.eu-west-2.amazonaws.com/dev"
    },
    cognito: {
      REGION: "us-east-2",
      USER_POOL_ID: "us-east-2_Evw1X1opG",
      APP_CLIENT_ID: "3mt05lhgc34tu32cai6p6e2v2t",
      IDENTITY_POOL_ID: "us-east-2:43b54a43-304f-4940-ae77-d43143e47305"
    }
  };