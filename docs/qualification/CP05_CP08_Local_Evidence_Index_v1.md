# CP-05 through CP-08 local evidence archive

Twelve actual qualification, restart and privilege records copied byte-for-byte into `CP05_CP08_Local_Evidence_Archive_v1.json` using gzip/base64. Original local files were not changed or rerun for archiving. Each entry retains its original document hash; tested implementation/fixture hashes remain those recorded inside that document. No self-hashing report is required. These are contemporaneous local/synthetic qualifications, not operational publisher or production approvals.

Sanitization checked original records and decoded logs for the existing credentials, private keys, authenticated DB URLs and raw process capability fields; no sensitive values were found, so no evidence values were rewritten. Historical CP-08 pushed=false remains as originally recorded; its later checkpoint push was separately verified.

| Original record | Original document SHA-256 | Original bytes |
|---|---|---:|
| PELORA-01-CP05-Qualification.json | 490cec4988219fbd67573474756d9d431d8ca6d9fcbee62b30879852e3d9aeb7 | 30538 |
| PELORA-01-CP05-Restart.json | ecd3a681461aba2eebbd5aeef7d109dcd47e7b460b4b40206043a5f3c50443b8 | 5547 |
| PELORA-01-CP05-Worker-Privileges.json | d069318bcf9d84656e26fac536ca419997dabeb807b1e27177d7d5c16ec2d0cd | 5434 |
| PELORA-01-CP06-Qualification.json | 6fc210e598350d93c2772eccbd720122b0d90154ca41c30a99498a895c1d8678 | 36841 |
| PELORA-01-CP06-Restart.json | 6d488bcc51cfa430cd08040c5b32b9b16e7d078ebaa4652a4a7f62f9ba935b38 | 6655 |
| PELORA-01-CP06-Worker-Privileges.json | abb063600c45e9130829354a4e33dceaea26f9790a1113d0eb51612b19721c61 | 5990 |
| PELORA-01-CP07-Qualification.json | b2f57ccf5dda6c5ed11d3ee9db892c90f498b9ae21e07691730e8e2599f805a0 | 38415 |
| PELORA-01-CP07-Restart.json | 36091a32073831390fbc1d39d6a6619f49ba57090f5a0d61b8504ad1c6f80539 | 7199 |
| PELORA-01-CP07-Read-Privileges.json | dc209f811535401415e3aabf4e06c12d01fabd92213d0566588bdcfb303fa002 | 6288 |
| PELORA-01-CP08-Qualification.json | a2f5aa17d38aeeaaecd832cd8ea3133a019c116b3e6fb1687619b91773d04698 | 187379 |
| PELORA-01-CP08-Restart.json | e52f24c49a0a7a94294c12e08c6c2b4af320bd2c30356ca81048822dc8cf3244 | 8350 |
| PELORA-01-CP08-Worker-Privileges.json | 4c814823f54303d319ecaa24dc298d8e49858b149fbca1c2425021b140fc8da6 | 6847 |
