// 修改2:弹窗中填入签入信息包括密码，目前只有点击签入按钮才调用

// Base64编码的PNG图片数据
const BASE64_IMAGES = {
  callBtn: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANMSURBVHgB7dzhddMwFAXgGw4DdAO0ARmhnYBugDegG8RMQJmgZYKyQcIEZQOHCVImuEhIoWkbW5ItV1J43zk6/VOcl4sky1JSQAgh6kFyCTGeDnAnIU5AS0Ici48kxDH4lIQYiy9JiDF43OuEqF/kk24d45kCb3Q7Q2aeGucL0YU31RqZ0f8fPU+IHNfzjsk63wTUFxXiW4RTSMMU9xMT6Td5rn98RHpmmlnr618sFgtvnTEBlkbp1mAewSG+geizD3FwOMcEuEUaCvXwhpijB2ZfykQaDFF6YJjeEGMC/IU03qNOR0OMCfABaSgW8ESSSo4hbCjUx3SgF8uaXAGeoy5HwzNiAtwgnQ+oR294RnCA+gIPSDcPLiuZBwfDM2LXgRukYcIrfRPTG54R+yz8Q7dLpKEwzVa3W8RrAn4nKLxoZgeE6ShkEFDX7BurO07XIhPmDM8VcMtpWmTEnOG5AhqO1yKzrOG5As44bhi3KEDW8A6KWDNOi0JkD88VEXM3blGQ7OEdFBIyjFsUpojwXCFtbeEZRYTnCvHdTBoUqIjw9nQx1wMBdjyhjdNZ6IAUKxzGReHwk4kZ4gqin+uFQ3Nh9g8UFY/+O/IVRD/aO3JHGcrj0f90cg8xTId05wnxC0Q/hu3UyHw4hGEbDecQ/Tj8hELKVwv86N8zlBCH0C6wu9cO0b2uOXZIdfyaD/1PKfsQk7xZfZ3VkeuvdbviTPPuAjNzPcw8zvl2Zlp9kP0Z419nZa4R8KvmsHzr2m88/dDUVtewQWkYfpI3ap3Y0/PGumeJ23ARIXaMeOxLHN7eDUoUEaKZF5uA6604jx1KpYtbMvxc+YY9vZHzhfcXSsawJc6h1bN/v+LMQt/L7HfhPrQ96w7hnxPc6mbu0u8QdredRN+Ng7LJFuAe7bnJCoWpJkCDdiFtljAKhQgNsIgvG+pav+sfF7p9Q2WK6IGHaJcvZkgrZFTVEH6O9knAbLxmmxtDAywa7XLnlhnglOQIMrS2qrop7dqxgf1bCQozOokhPESHeUn/KeDsPbB6tCeBjQszxVcwjA7/K9pTwSsXaMdxgo9eT3uc49+SaOmagn2WPsPjHKoOfn2r21c9/V1DCCGEEEIIIYr1B6FA0Zas4b7UAAAAAElFTkSuQmCC',
  holdBtn: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAA9CAYAAAAeYmHpAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAASASURBVHgB7ZtPc9tEFMDfk5wWFxhEQuOSC2KgaWbiDDpyw7lBUqb+Bkk+AekniP0NwicgHDnhzLSFnmJu3DDTdCbT9KDeTFKCC50kxJYeb5XakWPrj+1VsprwO8nWytbPq919+3YN8D9XA/S/GM/f/QbQXQVCEwYBsYFAlXf1sft2rdKABBjPL1LfEwQbB08frvS9Zm5xg88vnX8/c/ahLAy0zsIwMEQG39HyP62mya/mQXG0zhHSKowIixeM2QULFOdMmsAECeianiLpK8QVl0awQQJEZILiSK9pBNcAxelII8mpaVdSh5gkHWkenl+ABFDDz0BxfEMWyomkuKZNq6j0I+6TJhsk0WiemKAwZ21a02yQhAZYAIXpSDu6XgVJIMI9UJiOdMObHclp1xyDWyq3665xmmuoCnIwXrdaysbgXdLk0i8gCUI0QVG6pDXEGkjC0ZtVUJQu6ZfbD6py2jWWG7WfbVCU3tgbaRNGAssH2w9KoDA90pzrqsLQqC8s6JF29GuV4R7xdAgLeqTFeM21PWCHlh5hQabfm8gSBFSAWFyMMCL1TfM6EBw+a7qzQY5W7fmsoAs4JfwXj7YRUVW6arhNWObkWwglncKCQGk3k1kP69AQXRtSih504ri+c5ydnP6QDz/vWwDRyk3Nft/gcpAyQhODbqa1HniSMyR/t1ojr4pcBnrYyeP680Y2N/0xHwbNmKz3pmZ/eF3fSWTRLikiU8Cu7pRC2rbRbDW/g5ShRxXwantyOsuHhYAiZvbmp6+O9p//CikhVrLf68nDVkBQW7tlFU1ICbGkRWiqEa6EFDFOWs0fISVEPt5tDvee2W9N3rE4hJsJKHLr7dy0cbi3+xgUZ6C1LMpkVsICFl7SWR2f/Ur5YWzgvRYf5O8WXKCtsDKc954/zcKoSezHu414zLOTd96HoEgNvBRw8Z2btx8f7u/WQUGG2FVzykR+cYuChzFBQyea33/6SFqyURZDSxvWl6bm6FsRe1WkixszRVMfOynw89T488lPFRiCoaW9GxDircxvEfPuBs/IVoa9QT/j+YU1vuWS/z0WqJIGm5qLtbj9yEjSArGFSkNtKzrhQKWD7UdlGJJ+wgHUON1lI6LtEr7yT4GRNFv8MCNLCybmFpaJMDIG1xDWXz55eB8GZADhONSkSAviiotw9po+Nl+vVWyIgWRhj4GHrCCO9nZrN3K3X/ANFiOKGo7rLnPZP8Q1YQWTEBZIq+k28du4t0q6MaaPlfvVelLC3vdCAsQcznx0d3JJCgsSkRacDme6mHnFW6fmts69bpkIPkpS+PSrEobz5yWuyTVQCGkdWRBHe8+qN3Izv/MgKWJ1JbZkJC4tYPGd61OfbHJwICYql74tI/HH+zzeeA64Bpe4nfJCatqPGJuv8yIBuvQvhM/SEuPCa9rPm6Gt1O/PJUlyqdJtLlpeCek2b6aqy9zTLyXZ5pWS9jMx93XRJVrigCUqlh8YZaXbGFbR0J0T/gG0exyrF8R/wGBElJc+j5eN1cgiF79AJGuYZvAfht2VLGgJoicAAAAASUVORK5CYII=',
  unmuteBtn: 'data:image/png;base64,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',
  transferBtn: 'data:image/png;base64,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',
  consultationBtn: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAI9SURBVHgB7dxBbtNAGIbh/3ccVggFEBI7cgAqmRM0bNtNOQHpSaAnwb1BJZo1vQGRGvZZsqAhEiuwncHTKlJVzYztfLHaxt+znZlFXo09kRxHhIiIiO6HNpk8TI4Gf4q/o3LZQHaQmmj+NI6n8+nZsvaaOpNeJ0fDLM++GJGRdICqpP1e/+Tn9GxeObdqwqvkICmK6JsYs5O7LmAZiX74NTu/CE0KBrQ771+Rf+9gvLXlk7j/LrQTo9DqrMg+dTieNbC3rtAE7w4clAdGlGe/heRZ3H/uO1i8OzDO80To2s03D7fgJUxrsfc2xoAgBgQxIIgBQQwIYkAQA4IYEMSAIAYEMSCIAUEMCGJAEAOCGBAUS4tUo+Ory6+pa+zF20PjXGQkXfyYHDvX7B2m5fhH19hiNnE+nni5dzA2RoPPNRDcgSAGBDEgiAFBDAhq9RQWWe2Xp6BzxLjPYPvDnqE9Od2j8sazTPxrdF9a1GrAMtK4/ADjRmvsL8CMjqShNr+qhHgvYaOroVAl3gNBDAhiQBADghgQxIAgBgQxIIgBQQwIYkAQA4IYEMSAIAasJfe+/sqANajpMeDGVOahV14ZsIrR09AwA4aUu28xO/8cmsKAHip6seoV76vmtfxY85FRXaqRqejq9OpyktZZsuWAelK15XfNFi/h7sWzthSwm/GsLQTsbjwLDNjteBYQkPGsDQMy3toGARnvtoYBGe+uBgEZz6VmQMbzqRGQ8UIqAjLexuy/twkRERHRg/UfbMGnxU4YNK4AAAAASUVORK5CYII=',
  hangUpBtn: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAN3SURBVHgB7ZuLUeMwEIb/UAEdnDs4OrhQwVFCOoCrANMBVwG5CqAD5yoAKoivAuhgbzcSwSSxZVsPK5n9ZnYMQ4ikL3pLARRFURRFmYYZMoOICn7MW/68ms1mNZR2WOCC2lkgM86geKECPVGBnqhAT1SgJyrQExXoiQr0ZJRAntBecNziROCyXEuZkAIr782uDIJLTL0SkTLY936LLnFHHsWQmFJgQx5Fl9giL7jEVAIPyIsn0SEvqMQUAjvkDZbYdxCpbXRR0hEMLDaPpeNlNdzlHZzwOcczufGSGLMG9qh5ZMt43vc9B22o2jeuOFzVu+SNzzuMgCJtqPaseS8cl5zGO2KRqiaGJEbN883Q0UjMTl4jY9lLzFZeI4PZSkwlz2szwXa2lzCdb+dLkR5XmvEHjL44amKJiZC0Y9W84LRILDExByTmJ++DHYklMqEhMV95H1iJC2QG5+kme3mKoiiKoijpmOSGqp2PFTAbs/L8Zp+Ffcm5jSbvO1Fz/INZ08rvL1Osa5MIpM9d5h/2WSAOLzb+ItF14GgCWdqcHz85rhBPmIuaY8Xxh2WuEIGgAhvSFthvglNTw8i8y+6iOpmTtIqOh4qmXq+T2TS4JfeBe86syVPk4CZMZgS95rhB2Gb63hLA11G5QPg+tYZp2ksMZOi58JwfD/ArwGbKwfGKz1GzHjoFsR/kxzRInt/Rfp7clxojRXbCmS3Ir49bc9zLB0CR9+RsGpJWn8OuNh7JTL2CZEguH/r0c0+YCE57SX44TxPPOhLfVDr+8R5+fd0bjhc5CqioozYeFMj/IJPfZ/j3KafAnKOyTvbYE2ir7SPymwhPScHxeKhJbwWSmdfJCFtCaUOatIjcVq6NQNvGpb9bQHEhTXnbL5415KW55n8aiKuNRKmB0q4LKEMpOB5E4ALKWC5EYPJd3FNCBP6GMpYnESgrDdf9Ph9eMR014iHOfm1+ov43TYeyplCL8hHYcq0pPPu3vCi8xHvK4DYUmTW976ZCk/YrchRGYkUT1ro2KIxI9/1CGi9xTWbDNWs4j1c0rln3v5w5QuKSjujyoi3fkNo4/GbrAIk3OFLI3FoNL6+RQJfE+N/wTgCZr/Kug8trJHBIoiRY4EQgM8DsSqz6yOt9Kkfm/LSAWfots/iCSmAaZVzFugqiKIqiKIqiKIriz3+b3s0Sr2NNNQAAAABJRU5ErkJggg==',
  qzBtn: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAOjSURBVHgB7ZuBddMwEIb/MEFG0AbABLgTABOQTgBM0HYCHhMQJmiZIGaClgmiDdINhK65EDfEsaw7yU6t7z2/NImTuJ9P0ulkA4VCoVAoFAqFQqEweZxzC5eHe7/NIeQVpsmD3y5ms9kj hExRoJo8YmoCVeURUxKoLo+YisAk8ogpCEwmj8gq0KcNBnkhacnkEVkEUr7lt2/+zwp5oTzvM84ZijpOWteB+6dIpK9wjrC8Nf8TXwI/k2omcl4SD+QRJvBzKadyFZRJ0geyrJXfDL/04Dtyi+G5dcoDmbpAt52gN+URvzEO6Nh+QJEUEUh9jTl4rcZ4qDSbsqpA6r/8w7HBwmJcqEWhmkDuW9pGOotxYfhki9GMwGNNl3hMORMQ8AkKqAjk6Fu0vD1GeYRKX6gVgbmSVCoMvIVel/ABQ8MJ8+ZE8ho0hWt8X1si/W8Nw+2nh1I2EKIRgRW2+VUb4oUbHJSkOCm/gDw9mkubsYbArs5YKvBoPY+ff+T3JbyBAJFAblJVwH4GcZwshvLrFIkW8VQQII3AKnC/mLMcVEluSIwd7V9DQC6Bofvt6FWG5z7xBnEYDIVvmqvA0W7V4zsrF3nFQI/jOcRgCNzzel8XGqNx1/FULg6DSKRN2PTYd4HE+KZc+4efyEi0wIiIeo88LJERSQT2Fahah2uDo7BGJnIvrOeaM/dqxpLlhtwCs0Sh5w7heaGoWiQRGPvDUVHotovzVci+nD+GTvFEU8FogXyQMRIpCoPWiHe44wtVXYQuZP2BAGkTtojjyksJmt415PWdDoZGVg0BUoGxZ4+k3HalQgJ5xLibsMKPG7+t2iQK5YWOrLV0wV8qsIYMkvOfRKm8BrbjffGsRSTQnz2KQFEagL1EQ08U5YVQQ4hGHqgx99xJfHpEHnlLjet1NATeQQfjt3vkkUfE1g+fIRaYe+7Zk7ZRXiX6CK2p3HeMk2MCLZSij1AR6M8mNWNRPqXNiUT9RvNaRc1iwleMC3PkNWq6SyiiJpD7Qq0BRYPq4LlFgpOsXc66xHguZXvX+NviHO5U4gO8xMBwUr7rAy228iwSoF5Q5aasNspFUvGjRUJ5SfFRcO30WQT+9tptr94ySEyykr4/69cYIBK5av0L5xp5TbgMv3F6LAJ+M9dU8IlkEej2VZU5MsIVomykulMpZ0lqUFLeqfTi5RHaN9pMSh6heaPN5OQRWveJTFIeIRY4ZXmFQqFQKBQKhUKhMAx/AQ6ozdGZNDiYAAAAAElFTkSuQmCC',
  sxBtn: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAN9SURBVHgB7duPcdMwFAbwLxwDdAO0ARkhnYBuQJigZYKkE7SdoGWCsgFhAmACmwnKBg89pNDU9R9Jliw5eb87Xe7aNFa+SrIl2YAQQgghhBBCFI2ILnWpyN+TLve6nKEwtl5XSM2GN9Y3FMSGt7dBShTW8toskZmuwxn/Mxv1qihlD6F41sjIhvejJTyFAG9wQmwL42HksBfUupwvFosaAU4mwBThsbce7611URhP+by50eV3IV82VXi+lagojlvP444aP3lsiznmNfl04RpxKEzEhpS05fkE+BtxvMcEDsJTBz+uEbnb+gT4B3EoSjwjmSo8lqMLM4VEpgyP5QpwhQSmDo/5BLhDPB8QWY7wmHOAuhI8BsYaB5cxx8Fc4THfmcgOcXB4URYV cobHfAP8jngURsodHvMN8Cfi2WGEEsILQmZ1eaytx/FeTeX067KlHlWs6VlSupIPNM7W83gvApx1eMx+iUnCs8c7dDPr8BiZFd2QbrxFgIHPrGYV3h693k9IEp49VtHhLRBAV3wFcwZ0ca3PilsE4qQ6frVDwPRS1+UTSkBu3XiLkSgyRDZmT+Ru4PejWt5c+OyJNPHS/CXMtKxNrIvuBxwr3SNue3pLBdGPzIZNny1EP+qfmfCJRkF0s62w74z8CNGPuyr1+wjRjcz0riLpyuF0QKuBVljUvYFF4vFuIMQbiG7ktlKT/nbaOXPoymwF0Y36ZyhkW2n2W32LRsNrhhJiHzIX2NXUIZIZh9dHMUzQ8CxlH+IFItCfs2n57Ecb aJLWHrQi7cNWnK8Bh27l+KzXD73uXm0ch5/z2Dq8dQdzi8ov+/qi6DrE3PuOg9x38oIedmlpeWNwiy3uiSqfECvymPZFDm/vHiXyDHHt8HkbSuMJpaL2Owu63FNHa6R04f2DkpHbJc4eh71p/P2GEnP9LsnPwl3ItCxebHW9vKh1udblHdzOtqPos7FTNtkC3COzb5L2UdMAswmQkbmQ5qUuhUK4BljEw4a6rl/1y7kuXzAzRbTAQ2QuX7hLK2Q0qy7cRGYmwAuv2cZG1wCLRuZy54EywDHJEaRr3WbVTMlcO6514X1mhYSOogv30WFe0PAuYPIWOHv0vALNYcZ4BIOd7p1lZHYFr2ygFYVx3no97n6O/5dES1sUzFz6DM9jqDp4e63L3ZiVcSGEEEIIIYRI7y/Xt67c+D9vfgAAAABJRU5ErkJggg==',
  unmuteVoice: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAK8SURBVHgB7dyNcZswFAfw507ACHSCZgQ2aLoBI7QbtBPYG9AN3E6QeIJ0A+gEzgaveod8/Tj0AU9CUP9/d1xyxhDxRwgBIkQAAAAAAAB3jZkrM30009lMPf/W289agmkSjpmuHNYjyH+YQI4835FgcXgIUfB42Gq1VNCBCjIb35sfNem8munt4XB4pQLeUCG25tSkV5mppUKKBWi8p3QaKqRkgA+UzjsqpFgbKK0/JWTawCLbUrIG/hcQoBICVEKASghQCQEqIUAlBKiEAJUQoBICVEKASghQCQEqIUAlBKiEAJUQoBICVEKASuoAPaMLWtqInGVMUQMHWmagdH7QMgMppQjQNaQi9Nx36UZP+RmYXzs+Vw8HyVkDa/K7UDrfAvNdD94H2gL+ezTpzTWwjIxGjRlQGdJHlG/q77xQAqnOwt8nPpOAGtcCdjTVJ9L74ptpy1BNzErZhOhIIR21o4tY9sTLfY5Yf+dY9pG2gv2HYx2x/JIQTxHrrR3LBg/71UltcBT2HLm89NV6DpMdFVV72F37gkfG6jx7WzQz1iNBul5zkFcgqhnrcalpi9h9KF7XLLTdmT3vpfbdsL8t7NcIMRDeKmVQMQV8ZLesGxAIT7S0B+w/q/Y5NsTuOF/H/ER7Ygr8xH5ditpoa9058LeSXHWsisf28IXDOjPNHnDOY+f9yOHLQSlD1Jl7iawDs23BpR/YRHx9oPGmwMX+PtxenrHrqex65MaA9APriHU+m+lDqZdwkmF3JzunfbV5IRx/paEVfaWyOzw2+F85Hzn7Z2vvNuOPIFPcD7za4Gq6NzyeqW/XvnPClO8+8Yxr47tgwnhgfye84wVdnpw29VzYdDfkLrHvTvHFfmcz8GBdCQEqIUAlBKiEAJUQoBICVEKASghQqeh/Lppibwo0jtnP5kpkIAAAAAD6BQEWVwRj4HxhAAAAAElFTkSuQmCC',
  // JPG图片
  mute: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAGAAWAwERAAIRAQMRAf/EAHMAAQEBAQAAAAAAAAAAAAAAAAYHBQgBAQACAwAAAAAAAAAAAAAAAAQDBQABBhAAAQMEAQQBBQEAAAAAAAAAAQIDBAAREgUGITETFFFBYSJSIwcRAAEEAQQCAwAAAAAAAAAAAAEAEQIDQTESMgRRImITI//aAAwDAQACEQMRAD8A6oNaKxQnVb/bL5nHmKkuF1+Wht38jYtqcALdv1segqghdL7dcqpjbLfqrt9K6BWyw+Qb2TqdlrVOhCdRKWpmW+oG7bhH8je9gknvcUe20xkH4lRWTMSPCnsH/Pd3G5GzLd8adSxIEgzi4jEtIVmDa+VyB8VWx6khY54+UIdciT4TaFy5bkTY7d8ITpGZDTEN4JUFKQVpbcdVc9U5K6WHzT43uDI8XS426nCRy4seUwuPJbS6w4MVtrF0kfcGkyiCGKmIB1Qdrgcc8odjORnjx1McKZaLzhb8+Sels8u16COr+mdiMKPf4pv6UT1fV8KPWxw8GIwx7Y49rU7YGbCSwZl//9k=',
  noVideo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAFQAbAwERAAIRAQMRAf/EAIQAAAMBAAAAAAAAAAAAAAAAAAUGBwQBAQEBAQEBAAAAAAAAAAAAAAQDAgUBBhAAAQIFAgIFDQAAAAAAAAAAAQIDABESBAUhBjETQVEUFRZhMlKSo8PTVGSEBxcnEQABAwIFAQkBAAAAAAAAAAAAARECEgMhQWFCBDLwMVGhEyMUJAUV/9oADAMBAAIRAxEAPwC6b1zVrtzKWOUaCu1XM2rhlEqH2W5Tr10WioUql5OEA5V1LUkknfnqGvzSC1Gf9w7c+UvPVa+JHn9KHgpn5kdQ9id5YfJY5q/SpTDb1wLVtDwAWXVEAJASVekIRb5EZRfVi0LqSRw9OLuVJh+aPOxH3Huo5X6e0Bzciaxy gAwbcsMobvC3pClY0ZJptJBmlDnMbJmOioShViEniu2oRairouTl5j6A6zi/urwjTb+IeVKauzc2qfRXTTr1TiHI9PCsldo3AD+QfTe1g31tCPs6G/Znd4Te93UHbxuJ2pd0Wl+aZhAM6kEyoKpKHUeMb41ONPR28jVlsW6Rwhwk/9k=',
  unmute: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAFwAYAwERAAIRAQMRAf/EAGiAAAABwEBAQEBAAAAAAAAAAAEBQMCBgEABwgJCgsBAAICAwEBAQEBAAAAAAAAAAEAAgMEBQYHCAkKCxAAAgEDAwIEAgYHAwQCBgJzAQIDEQQABSESMUFRBhNhInGBFDKRoQcVsUIjwVLR4TMWYvAkcoLxJUM0U5KismNzwjVEJ5OjszYXVGR0w9LiCCaDCQoYGYSURUaktFbTVSga8uPzxNTk9GV1hZWltcXV5fVmdoaWprbG1ub2N0dXZ3eHl6e3x9fn9zhIWGh4iJiouMjY6PgpOUlZaXmJmam5ydnp+So6SlpqeoqaqrrK2ur6EQACAgECAwUFBAUGBAgDA20BAAIRAwQhEjFBBVETYSIGcYGRMqGx8BTB0eEjQhVSYnLxMyQ0Q4IWklMlomOywgdz0jXiRIMXVJMICQoYGSY2RRonZHRVN/Kjs8MoKdPj84SUpLTE1OT0ZXWFlaW1xdXl9UZWZnaGlqa2xtbm9kdXZ3eHl6e3x9fn9zhIWGh4iJiouMjY6Pg5SVlpeYmZqbnJ2en5KjpKWmp6ipqqusra6vr/2gAMAwEAAhEDEQA/APQGoa9qWia0x1Wj6DeMq292i0+rvSnCWn7Lfz5iyyyhL1fQf9i0SyGJ35Fg8upebNN89WwvbqUpc3Kemquxt5IJXC/AtePHif8AY/62a85Mkcu55lxDKccgvq9g7ZuXZP8A/9D0P5m1IW19YWN9DE+h6kXt7qSUH4ZStYhWvEBz7ZjZ50QJfRJpySogH6Sw+0jvNGnj0vzNbSPo1tco+m6p1EDK3JPj Ff3bU+JT9jMKIMDWQegH0ycYAxNSHp/nM+0681SW91E3cUcWnwsgsJQfikThyd2PIrxqfh+zmxhMkm+TmRJ3vk//0fUN/YWd/ayWt5Cs9vKKPG4qD/QjxyM4iQoolEEUWCReTZH8zy6TPLqD+XI4BNHG8snoNJyX91ypx4gH7I+P4ftZgflrmYni4HE8C5Ub4E007RNW0+afy9Ir3nl29hlWG65AS26spVomJ6jf93Qf822wxSiTDnjLZGBHp/hL/9k=',
  video: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAFQAbAwERAAIRAQMRAf/EAIAAAQEBAQAAAAAAAAAAAAAAAAUGBwgBAQEBAQAAAAAAAAAAAAAAAAMEBQYQAAAEBAMFBQkAAAAAAAAAAAERAgMAEgQFMhMGIUEUFRZRgVKSI6PD01RkhAcXJxEAAQMCBAUFAAAAAAAAAAAAABECAwESMWFCBCFBUSITIxQkBRX/2gAMAwEAAhEDEQA/AOi9UaxtunOH41t10amfLBkEiPpkZzKT4giefctiRQpZqMxAf3Fpz5Ss8rXxIn/SZ0qD7xuY/adZWe5W5qvQpTDb1QFI2h4ABYuqEABIAkVHiCKI9y1zVzQZktHUUcOHUUzH804rR9x7qMr7PSQb3kZnGSQFDpygug1dlrRBSraFyabSICaUOZjYiYbpgKK4GOVtdNxRE2q0ryU3mOgNZQDVXSJU/UWURq4bNmPdPLLt7DgNx4+F4Utmon/5B9N7WJvjZA+jkU9h6Z5WHKMnl+bslw5swFi2zGRd0VReO3twGZYnbgMQ4p//2Q=='
};

var _phoneBar = new ccPhoneBarSocket();
//var scriptServer = "[fc00::655:9e5a]";
var scriptServer = "10.6.0.59";
let host = window.location.host;
// 如果是带方括号的 IPv6 地址
if (host.startsWith("[")) {
    scriptServer = "[fc00::655:9e5a]";
}
var extnum = '1103'; //分机号
var opnum = '1103'; //工号
var gatewayList = [
    {
        "uuid": "1",
        "updateTime": 1758862985998,
        "gatewayAddr": "[fc00::655:9e5a]:5060",
        "callerNumber": "007",
        "calleePrefix": "",
        "priority": 1,
        "concurrency": 2,
        "register": false,
        "audioCodec": "pcma"
    }
  ]

var jsSipUAInstance = new jsSipUA();

// 签入时间计时器
var loginTimeInterval = null;
var loginStartTime = null;

// 启动签入时间计时器
function startLoginTimer() {
  // 清除已存在的定时器
  if (loginTimeInterval) {
    clearInterval(loginTimeInterval);
  }
  
  // 记录签入开始时间
  loginStartTime = new Date();
  
  // 每秒更新一次
  loginTimeInterval = setInterval(function() {
    var now = new Date();
    var elapsed = Math.floor((now - loginStartTime) / 1000); // 经过的秒数
    
    var hours = Math.floor(elapsed / 3600);
    var minutes = Math.floor((elapsed % 3600) / 60);
    var seconds = elapsed % 60;
    
    // 格式化为 HH:MM:SS
    var timeStr = 
      (hours < 10 ? '0' : '') + hours + ':' +
      (minutes < 10 ? '0' : '') + minutes + ':' +
      (seconds < 10 ? '0' : '') + seconds;
    
    $("#loginTime").text(timeStr);
  }, 1000);
  
  // 立即显示 00:00:00
  $("#loginTime").text("00:00:00");
}

// 停止签入时间计时器
function stopLoginTimer() {
  if (loginTimeInterval) {
    clearInterval(loginTimeInterval);
    loginTimeInterval = null;
  }
  loginStartTime = null;
  $("#loginTime").text("00:00:00");
}

// 自动签入函数 - 用于强置按钮
function autoSignin() {
  // 获取之前输入的签入信息
  var savedOpnum = $('#signinOpnum').val()
  var savedPassword = $('#signinPassword').val();
  var savedExtnum = $('#signinExtnum').val()
  
  console.log('强置按钮自动签入，使用保存的信息：', {
    opnum: savedOpnum,
    extnum: savedExtnum,
    hasPassword: !!savedPassword
  });
  
  // 重要：在重新初始化前解绑所有事件，防止重复绑定
  console.log('解绑所有按钮事件，防止重复绑定');
  $('#callBtn').off('click');
  $('#setFree').off('click');
  $('#setBusy').off('click');
  $('#setBusySubList').off('click');
  $('#hangUpBtn').off('click');
  $('#holdBtn').off('click');
  $('#unHoldBtn').off('click');
  $('#transferBtn').off('click');
  $('#consultationBtn').off('click');
  $('#onLineBtn').off('click');
  $('#resetStatus').off('click');
  $('#ccphoneNumber').off('keydown');
  $(document).off('keyup');
  
  // 如果没有保存的密码，需要重新显示签入弹窗
//   if (!savedPassword || !savedOpnum || !savedExtnum) {
//     console.log('缺少签入信息，显示签入弹窗');
//     $('#onLineBtn').trigger('click');
//     return;
//   }
  
  // 更新全局变量
  extnum = savedExtnum;
  opnum = savedOpnum;
  
  // 执行自动签入流程
  loadLoginToken();
  loadExtPassword(savedPassword);
  
  // 等待所有脚本加载完成后初始化配置
  var checkCount = 0;
  var maxCheckCount = 100; // 最多检查100次（10秒）
  var checkInterval = setInterval(function() {
    checkCount++;
    
    // 检查必需的全局变量是否都已加载
    if (typeof loginToken !== 'undefined' && loginToken && 
        typeof _phoneEncryptPassword !== 'undefined' && _phoneEncryptPassword) {
      
      clearInterval(checkInterval);
      
      // 更新配置对象
      _callConfig["loginToken"] = loginToken;
      _callConfig["extPassword"] = _phoneEncryptPassword;
      
      console.log('自动签入配置已更新，开始连接');
       _callConfig["gatewayList"] = [
            {
              "uuid": "1",
              "updateTime": 1758862985998,
              "gatewayAddr": "[fc00::655:9e5a]:5060",
              "callerNumber": "007",
              "calleePrefix": "",
              "priority": 1,
              "concurrency": 2,
              "register": false,
              "audioCodec": "pcma"
            }
        ];
      // 初始化并连接
      _phoneBar.initConfig(_callConfig);
            var _phoneConfig = {
              'extnum': savedExtnum,  //分机号
              'password': savedPassword, //分机密码  
            'fsHost': scriptServer,//电话服务器主机host地址，必须是 "域名格式的"，不能是ip地址
              'fsPort': '5066',  //电话服务器端口，必须是数字
              'audioHandler': document.getElementById("audioHandler"),
          };
        //设置来电接听超时时间
          jsSipUAInstance.setCallAnswerTimeOut(20);

        // 设置来电是否自动应答（默认不自动接听）
          jsSipUAInstance.setAutoAnswer(false);

          jsSipUAInstance.register(_phoneConfig);

          // 建立 WebSocket 连接
          _phoneBar.connect();
      
      // 启动签入时间计时器
      startLoginTimer();
      
    } else if (checkCount >= maxCheckCount) {
      clearInterval(checkInterval);
      console.error('自动签入超时，脚本加载失败');
      alert('自动签入失败，请手动重新签入');
    }
  }, 100);
}

// 弹窗工具函数（不依赖Bootstrap）
var ModalUtil = {
  show: function(modalId) {
    var modal = document.getElementById(modalId);
    var overlay = document.getElementById(modalId + '-overlay');
    if (modal) {
      modal.classList.add('show');
      if (overlay) overlay.classList.add('show');
    }
  },
  hide: function(modalId) {
    var modal = document.getElementById(modalId);
    var overlay = document.getElementById(modalId + '-overlay');
    if (modal) {
      modal.classList.remove('show');
      if (overlay) overlay.classList.remove('show');
    }
  },
  remove: function(modalId) {
    var modal = document.getElementById(modalId);
    var overlay = document.getElementById(modalId + '-overlay');
    if (modal) modal.remove();
    if (overlay) overlay.remove();
  }
};

var skillLevel = 9; //技能等级
var groupId = 1; // 业务组id
// if (window.location.href.toString().indexOf("?") != -1) {
//   console.log(ccPhoneBarSocket.utils);
//   extnum = ccPhoneBarSocket.utils.getQueryParam("extNum");
//   opnum = ccPhoneBarSocket.utils.getQueryParam("opNum");
//   groupId = ccPhoneBarSocket.utils.getQueryParam("groupId");
//   console.log("extNum=", extnum, "opNum=", opnum);
// }

function resetExtNumAndOpNum (ext, op, groupId) {
  window.location.href = "?extNum=" + ext + "&opNum=" + op + "&groupId=" + groupId;
};


// 修改1:这三个现在需要签入时候调用
// 流程：需要修改的地方：
// 1.签入按钮逻辑 ✓
// 2.弹窗中填入签入信息包括密码，目前只有点击签入按钮才调用 （需要修改执行逻辑，等token都存入之后再）✓
// 3.咨询时候，客服人员没有加载出来
function loadLoginToken () {

  // 目前已经把 projectId 和 groupId合并为同一个参数;
  var getTokenUrl = "http://" + scriptServer + ":8880/call-center/create-token";
  var destUrl = getTokenUrl + "?extnum=" + extnum + "&opnum=" + opnum
    + "&groupId=" + groupId + "&skillLevel=" + skillLevel
    ;

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = destUrl;
  document.getElementsByTagName('head')[0].appendChild(script);
}

// 修改4:可忽略
function loadExtPassword (extPassword) {
  // extPassword 参数从弹窗中获取
  var url = "http://" + scriptServer + ":8880/call-center/create-ext-password?pass=" + extPassword;
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}


// 修改5:可忽略 接口返回错误
function loadGatewayList () {
  var url = "http://" + scriptServer + ":8880/call-center/create-gateway-list";
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
loadGatewayList();

// 将视频级别填充到下拉列表中的函数
function populateVideoLevelDropdown (objId) {
  let select = document.getElementById(objId);
  if (select == null) return;
  // 遍历视频级别数据
  for (let key in ccPhoneBarSocket.videoLevels) {
    if (ccPhoneBarSocket.videoLevels.hasOwnProperty(key)) {
      let level = ccPhoneBarSocket.videoLevels[key];
      let option = document.createElement('option');
      option.value = level.levelId; // 设置值为 levelId
      option.text = level.description; // 显示文本
      select.appendChild(option);
    }
  }
  select.value = ccPhoneBarSocket.videoLevels.HD.levelId;
}

var _callConfig = null;

function onConferenceEnd () {
  document.getElementById("endConference").setAttribute("disabled", "true");
  document.getElementById("startConference").removeAttribute("disabled");
  document.getElementById("conference_member_list").style.display = "none";
  
  // 启用外呼按钮
  $("#callBtn").addClass('on');
  // 启用置闲按钮
  $("#setFree").addClass('on');
  // 启用签出按钮
  $("#onLineBtn").addClass('on');
  //移除所有的参会成员
  $(".conf_member_item_row").remove();

  let tips = "多方通话结束";
  $("#callStatus").text(tips);
  $("#agentStatus").text(tips);
}

function onConferenceStart () {
  document.getElementById("endConference").removeAttribute("disabled");
  document.getElementById("conference_member_list").style.display = "block";
  
  let tips = "多方通话进行中";
  $("#callStatus").text(tips);
  $("#agentStatus").text(tips);
}

/**
 *  成功把电话转接到多人视频会议
 */
function onTransferToConferenceSuccess (msg) {
  $("#callStatus").text("已接入多方会议");
  $("#setFree").removeClass("on");
  $("#setBusy").removeClass("on");
  $("#callBtn").removeClass("on");

  //界面显示成功转接到视频会议电话
  var phone = msg.object.phone;
  var name = msg.object.phone;
  console.log("onTransferToConferenceSuccess:", msg);
  _phoneBar.conferenceAddMemberFromExistCall(name, phone);
}


// 以下是通话转接操作界面的功能
// 注意：不在这里获取元素，因为此时DOM还未创建

// 填充 transfer_to_groupId 数据
function populateGroupIdOptions () {
  const transferToGroupId = document.getElementById("transfer_to_groupIds");
  if (!transferToGroupId) {
    console.error('找不到 transfer_to_groupIds 元素');
    return;
  }
  
  transferToGroupId.length = 0; //清除所有选项
  let groups = _phoneBar.callConfig.groups;
  console.log('groups = ', groups);
  groups.forEach(group => {
    const option = document.createElement("option");
    option.value = group.groupId;
    option.textContent = group.bizGroupName;
    transferToGroupId.appendChild(option);
  });
  if (transferToGroupId.selectedIndex == -1) {
    transferToGroupId.selectedIndex = 0;
  }
};

// 根据选中的 groupId 填充 transfer_to_member 数据
function populateMemberIdOptions (members, selectedGroupId) {
  console.log('当前成员', members, '选中组', selectedGroupId);
  const transferToMember = document.getElementById("transfer_to_member");
  if (!transferToMember) {
    console.error('找不到 transfer_to_member 元素');
    return;
  }
  
  if (!Array.isArray(members)) {
    console.error("populateMemberOptions: members is not a Array.", members);
    return;
  }
  transferToMember.innerHTML = '<option value="">请选择</option>';
  members
    .filter(member => member.groupId === selectedGroupId)
    .forEach(member => {
      const option = document.createElement("option");
      const statusMap = { 1: "刚签入", 2: "空闲", 3: "忙碌", 4: "通话中", 5: "事后处理" };
      option.value = member.opnum;
      option.textContent = `${member.opnum}(${statusMap[member.agentStatus] || ""})`;
      transferToMember.appendChild(option);
    });
};

function refreshMemberIdList () {
  const transferToGroupId = document.getElementById("transfer_to_groupIds");
  const transferToMember = document.getElementById("transfer_to_member");
  
  if (!transferToGroupId || !transferToMember) {
    console.error('找不到转接相关元素');
    return;
  }
  
  const selectedGroupId = transferToGroupId.value;
  if (selectedGroupId != "") {
    let origValue = transferToMember.value;
    populateMemberIdOptions(_phoneBar.callConfig.agentList, selectedGroupId);
    //判断原始选择项是否还存在，存在则重新赋值;
    let hasValue = transferToMember.querySelector(`option[value="${origValue}"]`) !== null;
    if (hasValue) {
      transferToMember.value = origValue;
    }
  }
}

/* asr实时对话文本框的功能 */
_phoneBar.on(ccPhoneBarSocket.eventList.asr_process_started, function (msg) {
  $(chatMessages).html("");
});
_phoneBar.on(ccPhoneBarSocket.eventList.asr_result_generate, function (msg) {
  handleAsrMessage(msg);
});
_phoneBar.on(ccPhoneBarSocket.eventList.asr_process_end_customer, function (msg) {
  handleAsrMessage(msg);
});
_phoneBar.on(ccPhoneBarSocket.eventList.asr_process_end_agent, function (msg) {
  handleAsrMessage(msg);
});
const chatMessages = document.getElementById('chat-messages');
$("#chat-container").hide();
function handleAsrMessage (data) {
  
}
function addMessageToChat (role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message ' + (role === 1 ? 'customer' : 'agent');

  // 添加角色名称
  const roleHeader = document.createElement('div');
  roleHeader.className = 'message-header';
  roleHeader.textContent = role === 1 ? '客户' : '我';

  const messageContent = document.createElement('div');
  messageContent.textContent = text;

  // messageDiv.appendChild(roleHeader);
  messageDiv.appendChild(messageContent);
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}
function addSystemMessage (text) {
  const systemMessage = document.createElement('div');
  systemMessage.className = 'system-message';
  systemMessage.textContent = text;
  chatMessages.appendChild(systemMessage);
  scrollToBottom();
}
function scrollToBottom () {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

//页面刷新或者关闭时，自动挂机; 避免导致投诉
window.onbeforeunload = function () {
    if (!jsSipUAInstance.isExtensionFree()) {
        jsSipUAInstance.hangup();
        console.log("onbeforeunload hangup.");
    }
    _phoneBar.disconnect();
};

// 接听电话
function answer() {
    jsSipUAInstance.answer();
}

function init () {
  // 页面加载时首先检查录音权限
  window.audioPermissionChecker.checkAudioPermission().then(hasPermission => {
      if (hasPermission) {
          console.log('录音权限检查通过，可以正常使用电话功能');
      } else {
          console.warn('录音权限检查失败，部分功能可能受限');
      }
  });


  $('#phone-bar').html(`
  <div>
      <audio hidden="true" id="audioHandler" controls="controls" autoplay="autoplay"></audio>
  </div>
  <form>

    <table width="1224">
      <tr>
        <td width="70%" colspan="2" height="35" class="status-bar">
          <div class="status-info-container">
            <div class="status-main-group">
              <div class="status-info-item login-time">
                <span>签入时间：</span> <span id="loginTime" title="" class="status4">00:00:00</span>
              </div>
              <div class="status-info-item calling-status">
                <span>状态：</span> <span id="agentStatus" title="" class="status4">未签入</span>
              </div>
              <div class="status-info-item normalColor">
                <span>当前排队人数：</span><span id="queueStat" title="" class="status4">0</span>
              </div>
              <div class="status-info-item noborder setStatus">
                <div class="status-toggle-container">
                  <a href="#" id="setFree" class="status-toggle-btn status-free default-status-free">置闲</a>
                  <a href="#" id="setBusy" class="status-toggle-btn status-busy default-status-busy">置忙</a>
                </div>
              </div>
            </div>
            <div class="status-info-item noborder">
              <div class="auto-answer-switch">
                <span class="auto-answer-label">自动接听</span>
                <label class="switch">
                  <input type="checkbox" id="autoAnswerToggle" class="auto-answer-checkbox" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>

        </td>
      </tr>
      <tr>
        <td width="70%">
          <div>
            <div class="head_dial">

              <dl class="dial">
                <dt>
                  <label for="ccphoneNumber"></label><input type="text" name="ccphoneNumber" id="ccphoneNumber"
                    placeholder="输入电话号码" class="tel_txt" />
                </dt>
                <dd>
                  <ul>
                    <li id="callStatus" title="" class="call-status status4">没有连接</li>
                  </ul>
                  <span id="showCallLen" class="call-status"><b>00:00</b></span>
                </dd>
              </dl>

              <ul class="dial_btn">
               <div>
                    <li><a href="#" id="callBtn" class="wh_btn"><img src="${BASE64_IMAGES.callBtn}" alt="外呼图标"><span>外呼</span></a></li>
                    <li class="separator-line"></li>
                    <li id="holdBtnLi"><a href="#" id="holdBtn" class="bc_btn off"><img src="${BASE64_IMAGES.holdBtn}" alt="保持图标"><span>保 持</span></a></li>
                    <li id="unHoldBtnLi"><a href="#" id="unHoldBtn" class="bc2_btn off"><img src="${BASE64_IMAGES.holdBtn}" alt="取消保持图标"><span>取消保持</span></a></li>
                    <li><a href="#" id="unmuteBtn" class="unmute_btn off not-signed-in"><img src="${BASE64_IMAGES.unmuteBtn}" alt="静音图标"><span>静音</span></a></li>
                    <li><a href="#" id="transferBtn" class="zjie_btn"><img src="${BASE64_IMAGES.transferBtn}" alt="转接图标"><span>转接</span></a></li>
                    <li><a href="#" id="consultationBtn" class="zixun_btn"><img src="${BASE64_IMAGES.consultationBtn}" alt="咨询图标"><span>咨询</span></a></li>
                    <li class="separator-line"></li>
                    <li><a href="#" id="conferenceBtn" class="hy_btn off"><span>会议</span></a></li>
                    <li><a href="#" id="hangUpBtn" class="gj_btn"><img src="${BASE64_IMAGES.hangUpBtn}" alt="挂机图标"><span>挂机</span></a></li>
               </div>
               <div>
                    <li><a href="#" id="resetStatus" class="qz_btn off"><img src="${BASE64_IMAGES.qzBtn}" alt="强置图标"><span>强置</span></a></li>
                    <li><a href="#" id="onLineBtn" class="sx_btn on"><img src="${BASE64_IMAGES.sxBtn}" alt="签入图标"><span>签入</span></a></li>
               </div>
                
                <li><a href="#" id="answer_btn" onclick="answer()" class="answer_btn off"></a><span>接听</span></li>
              </ul>
            </div>
          </div>
        </td>
        <td width="30%" class="hidden-section">
          <div>
            <div class="outbound-settings">
              &nbsp; &nbsp; 外呼设置：
              <label for="videoCallBtn"> <input type="radio" value="video" name="callType"
                  id="videoCallBtn" />视频外呼</label> &nbsp;&nbsp;
              <label for="audioCallBtn"> <input type="radio" value="audio" name="callType" checked="checked"
                  id="audioCallBtn" />语音外呼</label> <br />

              &nbsp; &nbsp; 视频清晰度:
              <label for="videoLevelSelect"></label><select id="videoLevelSelect">
              </select>
              <input type="button" id="reInviteVideoBtn" title="发送视频邀请，可把音频通话转换为视频通话。"
                onclick="_phoneBar.reInviteVideoCall();" value="视频邀请" disabled="disabled">

              &nbsp;&nbsp;&nbsp;&nbsp;
              <label for="videoListSelect"></label>
              <select id="videoListSelect">
                <option value="">请选择视频</option>
                <option value="/usr/local/freeswitchvideo/share/freeswitch/sounds/bank.mp4">客服实例视频</option>
                <option value="/usr/local/freeswitchvideo/share/freeswitch/sounds/conference.mp4">多方会议视频</option>
                <option value="/usr/local/freeswitchvideo/share/freeswitch/sounds/15-seconds.mp4">15-seconds-demo
                </option>

              </select>
              <input type="button" id="sendVideoFileBtn" title="推送视频给对方，以便结束当前通话。"
                onclick="_phoneBar.sendVideoFile($('#videoListSelect').val());" value="推送视频" disabled="disabled">

            </div>
          </div>
        </td>
      </tr>

      <tr id="conference_area" class="hidden-section">

        <td colspan="2" class="conference-area">
          <div>
            <div>
              <div id="conference_start" class="conference-controls">
                <!-- 会议布局: &nbsp; -->
                <select id="conf_layout" name="conf_layout" class="hidden-section">
                  <option value="2x2">2x2</option>
                  <option value="3x3">3x3</option>
                  <option value="1up_top_left+3">一主三从</option>
                </select>
                &nbsp;
                <!-- 画布尺寸: -->
                <select id="conf_template" name="conf_template" class="hidden-section">
                  <option value="480p" selected="selected">480x640</option>
                  <option value="720p">720x1080</option>
                  <option value="default">default</option>
                </select>
                &nbsp;
                会议类型:
                <select id="conf_call_type2" name="conf_call_type2">
                  <!-- <option value="video">视频</option> -->
                  <option value="audio">音频</option>
                </select>
                <input type="hidden" value="audio" id="conf_call_type" name="conf_call_type" />
                &nbsp;
                <input type="button" name="startConference" id="startConference"
                  onclick="conferenceStartBtnUI('')" class="conference-button" value="启动会议">
                &nbsp;
                <input type="button" name="endConference" id="endConference" onclick="_phoneBar.conferenceEnd()"
                  disabled="disabled" class="conference-button" value="结束会议">
              </div>

              <div class="conference-spacer"> &nbsp; </div>

              <div id="conference_member_list" class="conference-member-list hidden-section">
                <ul>
                  <li id="conference_header">
                    <span class="conf_name"> <input id="member_name" name="member_name" placeholder="姓名" /> </span> &nbsp;
                    <span class="conf_phone"> <input id="member_phone" name="member_phone" placeholder="手机号" /> </span> &nbsp;
                    <span class="conf_call_type">
                      <select id="member_call_type" name="member_call_type" class="hidden-section">
                        <option value="video">视频</option>
                        <option value="audio" selected>音频</option>
                      </select>
                    </span>
                    <span class="conf_video_level hidden-section">
                      <select id="member_video_level" name="member_video_level">
                      </select>
                    </span>

                    <span class="conf_name">
                      <input type="button" name="addConfMember" id="addConfMember"
                        onclick="_phoneBar.conferenceAddMemberBtnUI(0)" class="conference-button" value="加入会议">
                    </span>
                  </li>

                  <!-- 会议成员展示模版html  -->
                  <li id="conf_member_template" class="hidden-section">
                    <span class="conf_name">{member_name}</span>
                    <span class="conf_phone">{member_phone}</span>
                    <span class="conf_mute"><a href="javascript:void(0)"
                        onclick="_phoneBar.conferenceMuteMember('{member_phone}')"><img alt="禁言该成员。"
                          src="${BASE64_IMAGES.mute}" width="15" height="17" /> </a> </span>
                    <span class="conf_vmute hidden-section"><a href="javascript:void(0)"
                        onclick="_phoneBar.conferenceVMuteMember('{member_phone}')"><img alt="关闭该成员的视频。"
                          src="${BASE64_IMAGES.video}" /> </a></span>
                    <span class="conf_remove"><a href="javascript:void(0)"
                        onclick="_phoneBar.conferenceRemoveMembers('{member_phone}')" title="踢除会议成员。">移除</a></span>
                    <span class="conf_re_invite"><a href="javascript:void(0)"
                        onclick="_phoneBar.conferenceAddMemberBtnUI(1, '{member_phone}', '{member_name}')"
                        title="重新呼叫。">重呼</a></span>
                    <span class="conf_status">{member_status}</span>
                  </li>


                  <li></li>
                </ul>
              </div>


            </div>
          </div>
        </td>

      </tr>

      <tr id="transfer_area" width="100%" class="hidden-section">

        <td colspan="2" width="100%" class="transfer-area">
          <div class="transfer-header">
            <h5 class="modal-title">转接/咨询操作</h5>
            <button type="button" class="btn-close" onclick="document.getElementById('transfer_area').style.display='none';"></button>
          </div>
          <table width="100%">
            <tbody style="border:1px solid #E2E5E9;">
              <tr class="transfer-titles">
                <td width="90">业务组 </td>
                <td width="90">坐席成员</td>
              </tr>
              <tr>
                <td style="padding: 0 !important;">
                  <select size="10" id="transfer_to_groupIds" name="transfer_to_groupIds">
                    <option value="">请选择</option>
                  </select>
                </td>
                <td style="padding: 0 !important;">
                  <select size="10" id="transfer_to_member" name="transfer_to_member">
                    <option value="">请选择</option>
                  </select>
                </td>
              </tr>
            </tbody>
            <tr class="transfer-controls">
              <td colspan="2" style="padding: 20px; text-align: center;">
                <div style="margin-bottom: 15px;margin-top:10px;">
                  <input type="text" name="externalPhoneNumber" id="externalPhoneNumber" placeholder="电话号码"
                    title="可以把当前通话转接到外线号码上。 如果该文本框留空，则忽略处理。" />
                </div>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                  <input type="button" name="doTransferBtn" id="doTransferBtn"
                    onclick="transferBtnClickUI()" class="transfer-button" value="转接电话" title="把当前电话转接给他/她处理。" />
                  
                  <input type="button" name="stopCallWait" id="stopCallWait"
                    onclick="stopCallWaitBtnClickUI()" class="transfer-button" value="接回客户"
                    title="在咨询失败的情况下使用该按钮，接回处于等待中的电话。" />
                  
                  <input type="button" name="transferCallWait" id="transferCallWait"
                    onclick="transferCallWaitBtnClickUI()" class="transfer-button" value="转接客户"
                    title="在咨询成功的情况下使用该按钮，把电话转接给专家坐席。" />
                  
                  <input type="button" name="doConsultationBtn" id="doConsultationBtn"
                    onclick="consultationBtnClickUI()" class="transfer-button" value="拨号咨询" title="" />
                </div>
              </td>
            </tr>
          </table>
        </td>

      </tr>

    </table>
  </form>

 
`)

  $("#unHoldBtnLi").hide();
  $("#conferenceBtn").removeClass("on").addClass("off");
  
  // 隐藏接听和会议按钮
  $("#conferenceBtn").parent().hide();
  $("#answer_btn").parent().hide();

 // <div id="chat-container">
  //   <div id="chat-messages" class="message-container"></div>
  // </div>

  // 调用函数填充视频清晰度的下拉列表
  populateVideoLevelDropdown('videoLevelSelect');
  populateVideoLevelDropdown('member_video_level');

  //工具条对象断开事件
  // _phoneBar.on(ccPhoneBarSocket.eventList.ws_disconnected, function(msg){
  // 	console.log(msg);
  // });
  //
  // //工具条对象连接成功
  // _phoneBar.on(ccPhoneBarSocket.eventList.ws_connected, function(msg){
  //     console.log(msg);
  // });
  //
  // _phoneBar.on(ccPhoneBarSocket.eventList.callee_ringing, function(msg){
  // 	console.log(msg.content, "被叫振铃事件");
  // });
  // _phoneBar.on(ccPhoneBarSocket.eventList.caller_answered, function(msg){
  // 	console.log(msg, "主叫接通" );
  // });
  // _phoneBar.on(ccPhoneBarSocket.eventList.caller_hangup, function(msg){
  //     console.log(msg, "主叫挂断");
  // });
  //
  // _phoneBar.on(ccPhoneBarSocket.eventList.callee_answered, function(msg){
  // 	console.log(msg, "被叫接通");
  // });
  // _phoneBar.on(ccPhoneBarSocket.eventList.callee_hangup, function(msg){
  // 	console.log(msg, "被叫挂断");
  // });
  //
  // _phoneBar.on(ccPhoneBarSocket.eventList.status_changed, function(msg){
  // 	console.log("座席状态改变: " ,msg);
  // });
  //
  // // 一次外呼结束;
  // _phoneBar.on(ccPhoneBarSocket.eventList.outbound_finished, function(msg){
  // 	console.log('一次外呼结束', msg);
  // });

  // websocket通信对象断开事件;
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.ws_disconnected.code, function (msg) {
    console.log(msg);
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.ws_disconnected.code);
    $("#transfer_area").hide();
    $("#conferenceBtn").removeClass("on").addClass("off");
    jsSipUAInstance.unregister();
    // 停止签入时间计时器
    stopLoginTimer();
    // 签出后重新添加default-status-free类名
    $('#setFree').addClass('default-status-free');
    // 签出后重新添加置忙按钮的默认类名
    $('#setBusy').addClass('default-status-busy');
    // 签出后为静音按钮添加未签入类名并设置图标
    $('#unmuteBtn').addClass('not-signed-in');
    $('#unmuteBtn img').attr('src', BASE64_IMAGES.unmuteVoice);
    // 签出后为强置按钮添加off类名
    $('#resetStatus').addClass('off');
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.OUTBOUND_START, function (msg) {
    console.log('outbound_start', msg);
  });

  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.request_args_error.code, function (msg) {
    console.log(msg);
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.request_args_error.code);
  });

  //用户已在其他设备登录
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.user_login_on_other_device.code, function (msg) {
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.user_login_on_other_device.code);
    alert(ccPhoneBarSocket.eventListWithTextInfo.user_login_on_other_device.msg);
  });

  //websocket连接成功
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.ws_connected.code, function (msg) {
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.ws_connected.code);
    // 签入成功后移除default-status-free类名
    $('#setFree').removeClass('default-status-free');
    // 签入成功后移除置忙按钮的默认类名
    $('#setBusy').removeClass('default-status-busy');
    // 签入成功后移除静音按钮的未签入类名
    $('#unmuteBtn').removeClass('not-signed-in');
     $('#unmuteBtn img').attr('src', BASE64_IMAGES.unmuteVoice);
    // 签入成功后移除强置按钮的off类名
    $('#resetStatus').removeClass('off');
  });

  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_ringing.code, function (msg) {
    console.log(msg.content, "被叫振铃事件");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_ringing.code);
  });
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.caller_answered.code, function (msg) {
    console.log(msg, "主叫接通");
    $("#agentStatus").text("通话中");
    $('#setFree').addClass('default-status-free');
    $('#setBusy').addClass('default-status-busy');
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.caller_answered.code);
  });
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.caller_hangup.code, function (msg) {
    console.log(msg, "主叫挂断");
    $("#agentStatus").text("通话结束");
    $("#reInviteVideoBtn").attr("disabled", "disabled");
    $("#sendVideoFileBtn").attr("disabled", "disabled");
    $('#setFree').removeClass('default-status-free');
    $('#setBusy').removeClass('default-status-busy');
    $("#transfer_area").hide();
    $("#answer_btn").removeClass("on").addClass("off");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.caller_hangup.code);
  });

  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_answered.code, function (msg) {
    console.log(msg, "被叫接通");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_answered.code);
  });
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_hangup.code, function (msg) {
    console.log(msg, "被叫挂断");
    $("#transfer_area").hide();
    $("#answer_btn").removeClass("on").addClass("off");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_hangup.code);
  });

  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.status_changed.code, function (msg) {
    console.log("座席状态改变: ", msg["object"]["text"]);
    if(msg["object"]["text"] == "置忙"){
      msg["object"]["text"] = "小休";
    }else if(msg["object"]["text"] == "置闲"){
      msg["object"]["text"] = '闲'
    }
    $("#agentStatus").text(msg["object"]["text"]);

    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.status_changed.code);
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.acd_group_queue_number, function (msg) {
    console.log("当前排队人数消息: ", msg);
    $("#queueStat").text(msg["object"]["queue_number"]);
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.on_audio_call_connected, function (msg) {
    console.log("音频通话已建立: ", msg);
    $("#reInviteVideoBtn").removeAttr("disabled");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.customer_channel_hold, function (msg) {
    console.log("客户通话已保持: ", msg);
    $("#callStatus").text("通话已保持");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.customer_channel_unhold, function (msg) {
    console.log("客户通话已接回.", msg);
    $("#callStatus").text("客户通话已接回");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.on_video_call_connected, function (msg) {
    console.log("视频通话已建立: ", msg);
    $("#sendVideoFileBtn").removeAttr("disabled");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.inner_consultation_start, function (msg) {
    $("#callStatus").text("咨询开始.");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.inner_consultation_stop, function (msg) {
    $("#callStatus").text("咨询结束.");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.transfer_call_success, function (msg) {
    $("#callStatus").text("电话转接成功.");
    $("#externalPhoneNumber").val('');
  });

  // 订阅的坐席状态列表发生改变
  _phoneBar.on(ccPhoneBarSocket.eventList.agent_status_data_changed, function (msg) {
    console.log("订阅作息状态发生改变！！！！.");
    // 当 transfer_to_groupId 值改变时更新 transfer_to_member
    const transferToGroupId = document.getElementById("transfer_to_groupIds");
    if (transferToGroupId) {
      $(transferToGroupId).off("change");
      $(transferToGroupId).on("change", function () {
        refreshMemberIdList();
      });
      refreshMemberIdList();
    }
  });

  /* conference related events  */
  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_ANSWERED, function (msg) {
    console.log("会议成员已经接通.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var memberItemId = "#conf_member_" + memberPhone;

    $(".conf_status", $(memberItemId)).text(msg.object.status);
    $(".conf_status", $(memberItemId)).html("通话中").css("color", "green");

    $(".conf_mute", $(memberItemId)).find("img").show();
    $(".conf_vmute", $(memberItemId)).find("img").show();
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_VMUTED_SUCCESS, function (msg) {
    console.log("会议成员已被禁用视频.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var muteObj = $(".conf_vmute", $("#conf_member_" + memberPhone));
    muteObj.find("img")[0].src = BASE64_IMAGES.noVideo;
    muteObj.find("a").removeAttr("onclick");
    muteObj.find("a").off("click");
    muteObj.find("a").on("click", function () {
      _phoneBar.conferenceUnVMuteMember(memberPhone);
    });
  });
  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_UnVMUTED_SUCCESS, function (msg) {
    console.log("会议成员启用视频成功.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var muteObj = $(".conf_vmute", $("#conf_member_" + memberPhone));
    muteObj.find("img")[0].src = BASE64_IMAGES.video;
    muteObj.find("a").removeAttr("onclick");
    muteObj.find("a").off("click");
    muteObj.find("a").on("click", function () {
      _phoneBar.conferenceVMuteMember(memberPhone);
    });
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_MUTED_SUCCESS, function (msg) {
    console.log("会议成员已被禁言.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var muteObj = $(".conf_mute", $("#conf_member_" + memberPhone));
    muteObj.find("img")[0].src = BASE64_IMAGES.unmute;
    muteObj.find("a").removeAttr("onclick");
    muteObj.find("a").off("click");
    muteObj.find("a").on("click", function () {
      _phoneBar.conferenceUnMuteMember(memberPhone);
    });
  });
  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_UNMUTED_SUCCESS, function (msg) {
    console.log("会议成员解除禁言成功.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var muteObj = $(".conf_mute", $("#conf_member_" + memberPhone));
    muteObj.find("img")[0].src = BASE64_IMAGES.mute;
    muteObj.find("a").removeAttr("onclick");
    muteObj.find("a").off("click");
    muteObj.find("a").on("click", function () {
      _phoneBar.conferenceMuteMember(memberPhone);
    });
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_HANGUP, function (msg) {
    console.log("会议成员已经挂机.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var memberItemId = "#conf_member_" + memberPhone;

    // 隐藏 mute及 vmute按钮
    $(".conf_mute", $(memberItemId)).find("img").hide();
    $(".conf_vmute", $(memberItemId)).find("img").hide();
    $(".conf_re_invite", $(memberItemId)).show();

    var answerStatus = (msg.object.answeredTime === 0) ? "未接通" : msg.object.hangupClause;
    var color = (msg.object.answeredTime === 0) ? "red" : "green";
    $(".conf_status", $(memberItemId)).html("已挂机(" + answerStatus + ")").css("color", color);
    $(".conf_status", $(memberItemId)).fadeTo('fast', 0.1).fadeTo('fast', 1.0);
    var blinkText = setInterval(function () {
      $(".conf_status", $(memberItemId)).fadeTo('fast', 0.1).fadeTo('fast', 1.0);
    }, 700); // 每0.5秒闪烁一次

    setTimeout(function () {
      console.log("memberItemId=", memberItemId);
      clearInterval(blinkText);
      // $(memberItemId).remove(); //暂不自动移除参会者，由主持人手动操作处理;
    }, 5000);
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MODERATOR_ANSWERED, function (msg) {
    console.log("电话会议开始，主持人已接通.", msg);
    onConferenceStart();
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MODERATOR_HANGUP, function (msg) {
    console.log("电话会议结束，主持人已挂机.", msg);
    onConferenceEnd();
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_TRANSFER_SUCCESS_FROM_EXISTED_CALL, function (msg) {
    console.log("成功把通话转接到多人视频会议.", msg);
    onTransferToConferenceSuccess(msg);
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.new_inbound_call, function (msg) {
      console.log("新来电: ", msg.object.uuid);
  });

  // JsSIP 网页电话
  jsSipUAInstance.on('inbound_call', function (msg) {
      console.log('收到呼入来电，请弹窗确认框，以便确认是否接听...', msg);
      $("#answer_btn").removeClass("off").addClass("on");
      $("#hangUpBtn").removeClass("off").addClass("on");
      
      // 检查是否启用了自动接听
      var isAutoAnswer = $('#autoAnswerToggle').is(':checked');
      
      if (isAutoAnswer) {
        // 自动接听，不显示弹窗
        console.log('自动接听已启用，直接接听来电');
        jsSipUAInstance.answer();
        return;
      }
      
      // 未启用自动接听，显示来电弹窗
      var caller = msg.caller || '未知号码';
      var modalHtml =
        '<div class="modal-overlay" id="incomingCallModal-overlay"></div>' +
        '<div class="modal" id="incomingCallModal">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<p class="modal-title">来电提醒</p>' +
        '</div>' +
        '<div class="modal-body" style="text-align: center; padding: 30px 20px;min-height: 50px;">' +
        '<div style="font-size: 18px; margin-bottom: 10px;">来电号码</div>' +
        '<div style="font-size: 24px; font-weight: bold; color: #5178FF;">' + caller + '</div>' +
        '</div>' +
        '<div class="modal-footer" style="text-align: center; padding: 20px;">' +
        '<button type="button" class="btn btn-success" id="answerCallBtn" style="padding:0 15px;">接听</button>' +
        '<button type="button" class="btn btn-danger" id="rejectCallBtn" style="padding:0 15px;">取消</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
      
      // 移除旧弹窗
      ModalUtil.remove('incomingCallModal');
      
      // 添加弹窗到页面
      $('body').append(modalHtml);
      
      // 显示弹窗
      ModalUtil.show('incomingCallModal');
      
      // 接听按钮点击事件
      $(document).off('click', '#answerCallBtn').on('click', '#answerCallBtn', function() {
        console.log('用户点击接听按钮');
        jsSipUAInstance.answer();
        ModalUtil.hide('incomingCallModal');
        setTimeout(function() {
          ModalUtil.remove('incomingCallModal');
        }, 300);
      });
      
      // 取消按钮点击事件
      $(document).off('click', '#rejectCallBtn').on('click', '#rejectCallBtn', function() {
        jsSipUAInstance.hangup();
        ModalUtil.hide('incomingCallModal');
        setTimeout(function() {
          ModalUtil.remove('incomingCallModal');
        }, 300);
      });
  });

  jsSipUAInstance.on('disconnected', function (msg) {
      console.log('网页电话连接已经断开...', msg);
  });
  jsSipUAInstance.on('registered', function () {
      console.log('registered', '分机注册成功');
  });
  jsSipUAInstance.on('registrationFailed', function (msg) {
      console.log(msg, 'registrationFailed');
      _phoneBar.disconnect();
      $("#agentStatus").html("未签入");
       $('.zjie_btn').addClass('default-zjie-btn');
      // 停止签入时间计时器
      stopLoginTimer();
  });
  jsSipUAInstance.on('confirmed', function (msg) {
      console.log('电话接通', msg, 'confirmed');
      jsSipUAInstance.playAnsweredSound();
      $("#answer_btn").removeClass("on").addClass("off");
      
      // 电话接通后关闭来电弹窗
      if ($('#incomingCallModal').length > 0) {
        ModalUtil.hide('incomingCallModal');
        setTimeout(function() {
          ModalUtil.remove('incomingCallModal');
        }, 300);
      }
  });
  jsSipUAInstance.on('hungup', function (msg) {
      console.log('通话结束', 'hungup');
      
      // 挂断后关闭来电弹窗（如果还存在）
      if ($('#incomingCallModal').length > 0) {
        ModalUtil.hide('incomingCallModal');
        setTimeout(function() {
          ModalUtil.remove('incomingCallModal');
        }, 300);
      }
  });

  //通话保持；双方无法听到彼此的声音
  jsSipUAInstance.on('hold', function (msg) {
      console.log(msg);
  });

  //通话解除保持
  jsSipUAInstance.on('unhold', function (msg) {
      console.log(msg);
  });

  //通话静音; [客户无法听到自己的声音]
  jsSipUAInstance.on('muted', function (msg) {
      console.log(msg);
      //$("#unmuteBtn").removeClass("on").addClass("off");
  });
  // 通话静音解除
  jsSipUAInstance.on('unmuted', function (msg) {
      console.log(msg);
      //$("#unmuteBtn").removeClass("off").addClass("on");
  });

  // 电话工具条参数配置;
  _callConfig = {
    'useDefaultUi': true,
    // loginToken 信息是加密的字符串， 包含以下字段信息：extnum[分机号]、opnum[工号]、groupId[业务组]、skillLevel[技能等级]
    'loginToken': '',

    // 电话工具条服务器端的地址; 端口默认是1081
    'ipccServer': scriptServer + ':1081',

    // 网关列表， 默认需要加密后在在通过客户端向呼叫系统传递;
    // 注意在注册模式下，网关参数更改之后，必须重启语音服务 [docker restart freeswitch] 方可生效，不支持热更新;
    // 支持多个网关同时使用，按照优先级依次使用, 支持网关负载容错溢出 [第一条网关外呼出错后，自动使用第二条网关重试，直至外呼不出错] ;
    'gatewayList': gatewayList,

    // 网关列表信息是否为加密模式;
    'gatewayEncrypted': false
  };

  // 使用工具条之前需要先初始化 _callConfig 参数， 填充各个字段的值： 合计7个字段，必须填写正确 ；
  //********************************************************************************************
  // 以下代码设置加密的参数： loginToken、extPassword、gatewayList；   在本页面的demo演示中需要调用服务器端接口获取密文字符串;
  // 注意：此部分逻辑已移至签入确认按钮中执行

  // 页面加载时为转接按钮添加默认样式
  $(document).ready(function() {
    $('.zjie_btn').addClass('default-zjie-btn');
  });

  // 添加签入按钮点击事件 - 显示签入信息弹窗
  $(document).on('click', '#onLineBtn', function(e) {
    e.preventDefault();
    
    // 先判断是签出还是签入
    if ($(this).hasClass('on')) {
        if (_phoneBar.getIsConnected()) {
            // 执行签出
            _phoneBar.disconnect();
            jsSipUAInstance.unregister();
            $("#conferenceBtn").removeClass("on").addClass("off");
            // 停止签入时间计时器
            stopLoginTimer();
            // 清空表单字段（如果存在）
            $('#signinOpnum').val('');
            $('#signinPassword').val('');
            $('#signinExtnum').val('');
            _callConfig["loginToken"] = '';
            _callConfig["extPassword"] = '';
            // 清空全局变量
            if (typeof loginToken !== 'undefined') {
                loginToken = undefined;
            }
            if (typeof _phoneEncryptPassword !== 'undefined') {
                _phoneEncryptPassword = undefined;
            }
            // 添加转接按钮的默认样式
            $('.zjie_btn').addClass('default-zjie-btn');
            // 签出后重新添加置忙按钮的默认类名
            $('#setBusy').addClass('default-status-busy');
            console.log('签出成功，已清空表单和配置');
            return; // 签出后直接返回，不显示弹窗
        } else {
            // 未签入状态，显示签入弹窗
            // 在登录前再次检查录音权限
            window.audioPermissionChecker.checkAudioPermission().then(hasPermission => {
              if (hasPermission) {
                  console.log('录音权限检查通过，可以正常使用电话功能');
              } else {
                  console.warn('录音权限检查失败，部分功能可能受限');
              }
            });
        }
    } else {
        alert('当前不允许签出!');
        return;
    }
    
    // 以下是签入弹窗的显示逻辑
    var signinModalHtml =
      '<div class="modal-overlay" id="signinModal-overlay"></div>' +
      '<div class="modal" id="signinModal">' +
      '<div class="modal-dialog">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<p class="modal-title">座席签入</p>' +
      '<button type="button" class="btn-close" onclick="ModalUtil.hide(\'signinModal\')"></button>' +
      '</div>' +
      '<div class="modal-body">' +
      '<div class="form-group">' +
      '<label class="form-label">分机工号</label>' +
      '<input type="text" class="form-input" id="signinOpnum" placeholder="请输入分机工号">' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">座席密码</label>' +
      '<input type="password" class="form-input" id="signinPassword" placeholder="请输入座席密码">' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">分机号码</label>' +
      '<input type="text" class="form-input" id="signinExtnum" placeholder="请输入分机号码">' +
      '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<button type="button" class="btn btn-secondary" onclick="ModalUtil.hide(\'signinModal\')">取消</button>' +
      '<button type="button" class="btn btn-primary" id="confirmSigninBtn">确认签入</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    // 如果已经存在弹窗，先移除
    ModalUtil.remove('signinModal');
    
    // 添加弹窗到页面
    $('body').append(signinModalHtml);
    
    // 显示弹窗
    ModalUtil.show('signinModal');

    // 点击遮罩层关闭
    $('#signinModal-overlay').click(function() {
      ModalUtil.hide('signinModal');
    });
  });

    // 确认签入按钮点击事件
    $(document).on('click', '#confirmSigninBtn', function() {
      console.log('确认签入按钮！！！！');
      var opnumValue = $('#signinOpnum').val();
      var passwordValue = $('#signinPassword').val();
      var extnumValue = $('#signinExtnum').val();
      
      if (!opnumValue || !passwordValue || !extnumValue) {
        alert('请填写完整的签入信息！');
        return;
      }
      
      // 关闭弹窗
    ModalUtil.hide('signinModal');
      
      // 更新全局变量
      extnum = extnumValue;
      opnum = opnumValue;
      
      console.log('开始签入流程：', {
        opnum: opnumValue,
        password: passwordValue,
        extnum: extnumValue
      });
      
      // 按顺序调用加载函数
      loadLoginToken();
      loadExtPassword(passwordValue);
      
      // 等待所有脚本加载完成后初始化配置
      var checkCount = 0;
      var maxCheckCount = 100; // 最多检查100次（10秒）
      var checkInterval = setInterval(function() {
        checkCount++;
        
        // 移除转接按钮的默认样式
        $('.zjie_btn').removeClass('default-zjie-btn');
        
        // 检查必需的全局变量是否都已加载
        var tokenLoaded = typeof(loginToken) !== "undefined";
        var passwordLoaded = typeof(_phoneEncryptPassword) !== "undefined";
        
        if (tokenLoaded && passwordLoaded) {
          clearInterval(checkInterval);
          
          // 配置 loginToken
          if (typeof (loginToken) != "undefined") {
            _callConfig["loginToken"] = loginToken;
          } else {
            alert("电话工具条：无法获取 loginToken!");
            return;
          }

          // 配置 extPassword
          if (typeof (_phoneEncryptPassword) != "undefined") {
            _callConfig["extPassword"] = _phoneEncryptPassword;
          } else {
            alert("电话工具条：无法获取 _phoneEncryptPassword!");
            return;
          }

          // 配置 gatewayList
         _callConfig["gatewayList"] = [
            {
              "uuid": "1",
              "updateTime": 1758862985998,
              "gatewayAddr": "[fc00::655:9e5a]:5060",
              "callerNumber": "007",
              "calleePrefix": "",
              "priority": 1,
              "concurrency": 2,
              "register": false,
              "audioCodec": "pcma"
            }
        ];
          // 初始化电话工具条
          _phoneBar.initConfig(_callConfig);
          console.log(_callConfig,'✅ 电话工具条配置初始化完成');

          var _phoneConfig = {
              'extnum': extnumValue,		//分机号
              'password': passwordValue,	//分机密码  
            'fsHost': scriptServer,//电话服务器主机host地址，必须是 "域名格式的"，不能是ip地址
              'fsPort': '5066',		//电话服务器端口，必须是数字
              'audioHandler': document.getElementById("audioHandler"),
          };

          //设置来电接听超时时间
          jsSipUAInstance.setCallAnswerTimeOut(20);

        // 设置来电是否自动应答（默认不自动接听）
          jsSipUAInstance.setAutoAnswer(false);

          jsSipUAInstance.register(_phoneConfig);

          // 建立 WebSocket 连接
          _phoneBar.connect();
          
        // 启动签入时间计时器，从点击确认签入开始计时
        startLoginTimer();
        
        $("#conferenceBtn").removeClass("off").addClass("on");
        
        } else if (checkCount >= maxCheckCount) {
          // 超时处理
          clearInterval(checkInterval);
        }
      }, 100); // 每100ms检查一次
  });

  // 添加自动接听切换事件
  $(document).on('change', '#autoAnswerToggle', function() {
    var isChecked = $(this).is(':checked');
    if (typeof jsSipUAInstance !== 'undefined') {
      jsSipUAInstance.setAutoAnswer(isChecked);
      console.log('自动接听已' + (isChecked ? '启用' : '禁用'));
    }
  });

  // 添加咨询/转接按钮点击事件
  $(document).on('click', '#consultationBtn, #transferBtn', function(e) {
    e.preventDefault();

    var modalHtml =
      '<div class="modal-overlay" id="consultationModal-overlay"></div>' +
      '<div class="modal" id="consultationModal">' +
      '<div class="modal-dialog modal-dialog-lg transfer-modal">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<p class="modal-title">转接/咨询操作</p>' +
      '<button type="button" class="btn-close" onclick="ModalUtil.hide(\'consultationModal\')"></button>' +
      '</div>' +
      '<div class="modal-body" id="consultationModalBody">' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    // 如果已经存在弹窗，先移除
    ModalUtil.remove('consultationModal');

    // 添加弹窗到页面
    $('body').append(modalHtml);

    // 把 transfer_area 的内容移动到弹窗中
    var transferContent = $('#transfer_area > td > table').detach();
    $('#consultationModalBody').append(transferContent);
    $('#transfer_area').hide();

    // 显示弹窗
    ModalUtil.show('consultationModal');

    // 点击遮罩层关闭
    $('#consultationModal-overlay').click(function() {
      var transferContent = $('#consultationModalBody table').detach();
      $('#transfer_area > td').append(transferContent);
      $('#transfer_area').hide();
      ModalUtil.hide('consultationModal');
    });

    // 等弹窗显示后再初始化数据
    setTimeout(function() {
      populateGroupIdOptions();
    }, 100);

    // 弹窗关闭处理
    $(document).on('click', '.btn-close', function() {
      var transferContent = $('#consultationModalBody table').detach();
      $('#transfer_area > td').append(transferContent);
      $('#transfer_area').hide();
    });
  });

  // 添加会议按钮点击事件
  $(document).on('click', '#conferenceBtn', function(e) {
    e.preventDefault();

    var modalHtml =
      '<div class="modal-overlay" id="conferenceModal-overlay"></div>' +
      '<div class="modal" id="conferenceModal">' +
      '<div class="modal-dialog modal-dialog-lg">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title">会议管理</h5>' +
      '<button type="button" class="btn-close" onclick="ModalUtil.hide(\'conferenceModal\')"></button>' +
      '</div>' +
      '<div class="modal-body" id="conferenceModalBody">' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    // 如果已经存在弹窗，先移除
    ModalUtil.remove('conferenceModal');

    // 添加弹窗到页面
    $('body').append(modalHtml);

    // 把 conference_area 的内容移动到弹窗中
    var conferenceContent = $('#conference_area > td > div').detach();
    $('#conferenceModalBody').append(conferenceContent);
    $('#conference_area').hide();

    // 显示弹窗
    ModalUtil.show('conferenceModal');

    // 点击遮罩层关闭
    $('#conferenceModal-overlay').click(function() {
      var conferenceContent = $('#conferenceModalBody > div').detach();
      $('#conference_area > td').append(conferenceContent);
      $('#conference_area').hide();
      ModalUtil.hide('conferenceModal');
    });

    // 弹窗关闭处理
    $(document).on('click', '.btn-close', function() {
      var conferenceContent = $('#conferenceModalBody > div').detach();
      $('#conference_area > td').append(conferenceContent);
      $('#conference_area').hide();
    });
  });

}



// 录音权限检查功能
class AudioPermissionChecker {
    constructor() {
        this.hasPermission = false;
        this.isChecking = false;
    }

    // 检查录音权限
    async checkAudioPermission() {
        if (this.isChecking) {
            return this.hasPermission;
        }

        this.isChecking = true;

        try {
            // 检查浏览器是否支持getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('浏览器不支持录音功能，请使用Chrome、Firefox或Safari等现代浏览器');
            }

            // 请求录音权限
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true,
                video: false 
            });

            // 获取权限成功，立即停止录音流
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                this.hasPermission = true;
                console.log('录音权限获取成功');
                return true;
            }
        } catch (error) {
            this.hasPermission = false;
            console.error('录音权限获取失败:', error);
            
            // 根据错误类型显示不同的提示信息
            let errorMessage = '录音权限获取失败：';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += '用户拒绝了录音权限。请在浏览器设置中允许此网站使用麦克风。';
            } else if (error.name === 'NotFoundError') {
                errorMessage += '未找到录音设备。请检查麦克风是否正确连接。';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += '浏览器不支持录音功能。';
            } else {
                errorMessage += error.message || '未知错误';
            }
            
            this.showPermissionDialog(errorMessage);
            return false;
        } finally {
            this.isChecking = false;
        }
    }

    // 显示权限提示对话框
    showPermissionDialog(message) {
        const dialogHtml = `
            <div id="audioPermissionModal" class="audio-permission-modal" style="
                position: fixed;
                z-index: 10000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
            ">
                <div class="audio-permission-content" style="
                    background-color: #fff;
                    border-radius: 8px;
                    width: 500px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    position: relative;
                    padding: 20px;
                ">
                    <div class="audio-permission-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 15px;
                    ">
                        <h3 style="margin: 0; color: #e74c3c;">⚠️ 录音权限需要</h3>
                        <span class="close" onclick="hideAudioPermissionDialog()" style="
                            color: #999;
                            font-size: 24px;
                            font-weight: bold;
                            cursor: pointer;
                            line-height: 1;
                        ">&times;</span>
                    </div>
                    <div class="audio-permission-body">
                        <p style="margin-bottom: 15px; line-height: 1.6;">${message}</p>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                            <h4 style="margin-top: 0; color: #495057;">如何开启录音权限：</h4>
                            <ol style="margin: 0; padding-left: 20px; line-height: 1.6;">
                                <li>点击浏览器地址栏左侧的🔒或ℹ️图标</li>
                                <li>在弹出菜单中找到"麦克风"或"录音"选项</li>
                                <li>选择"允许"或"总是允许"</li>
                                <li>刷新页面重新尝试</li>
                            </ol>
                        </div>
                        <div style="text-align: center;">
                            <button onclick="retryAudioPermission()" style="
                                background-color: #007cba;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                margin: 5px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            ">重新检查权限</button>
                            <button onclick="continueWithoutPermission()" style="
                                background-color: #6c757d;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                margin: 5px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            ">暂时跳过</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 移除已存在的对话框
        const existingModal = document.getElementById('audioPermissionModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 添加新对话框
        document.body.insertAdjacentHTML('beforeend', dialogHtml);
    }

    // 隐藏权限对话框
    hidePermissionDialog() {
        const modal = document.getElementById('audioPermissionModal');
        if (modal) {
            modal.remove();
        }
    }

    // 获取当前权限状态
    getPermissionStatus() {
        return this.hasPermission;
    }
}

// 创建全局录音权限检查器实例
window.audioPermissionChecker = new AudioPermissionChecker();

// 全局函数
window.hideAudioPermissionDialog = function() {
    window.audioPermissionChecker.hidePermissionDialog();
};

window.retryAudioPermission = async function() {
    window.audioPermissionChecker.hidePermissionDialog();
    await window.audioPermissionChecker.checkAudioPermission();
};

window.continueWithoutPermission = function() {
    window.audioPermissionChecker.hidePermissionDialog();
    console.warn('用户选择在没有录音权限的情况下继续使用');
};

function transferBtnClickUI() {
    if (typeof _phoneBar !== 'undefined') {
        _phoneBar.transferBtnClickUI();
        var transferContent = $('#consultationModalBody table').detach();
        $('#transfer_area > td').append(transferContent);
        $('#transfer_area').hide();
        ModalUtil.hide('consultationModal');
    }
}

$(document).on('click', '#unmuteBtn', function(e) {
  if ($(this).hasClass('off')) {
    $("#unmuteBtn").removeClass("off").addClass("on");
    $("#unmuteBtn img").attr("src", BASE64_IMAGES.unmuteBtn);
    jsSipUAInstance.mute();
  } else {
    $("#unmuteBtn").removeClass("on").addClass("off");
    $("#unmuteBtn img").attr("src", BASE64_IMAGES.unmuteVoice);
    jsSipUAInstance.unmute();
  }
})


// 接回客户
function stopCallWaitBtnClickUI() {
    if (typeof _phoneBar !== 'undefined') {
        var transferContent = $('#consultationModalBody table').detach();
        $('#transfer_area > td').append(transferContent);
        $('#transfer_area').hide();
        ModalUtil.hide('consultationModal');
        if (!jsSipUAInstance.getAutoAnswer()) {
          jsSipUAInstance.setAutoAnswer(true);
          _phoneBar.stopCallWaitBtnClickUI();
          setTimeout(() => {
              jsSipUAInstance.setAutoAnswer(false);
          }, 3000);
        }else{ 
          _phoneBar.stopCallWaitBtnClickUI();
        }
    }
}


function consultationBtnClickUI() {
  console.log('consultationBtnClickUI');
    if (typeof _phoneBar !== 'undefined') {
        if (!jsSipUAInstance.getAutoAnswer()) {
          jsSipUAInstance.setAutoAnswer(true);
          _phoneBar.consultationBtnClickUI();
          setTimeout(() => {
              jsSipUAInstance.setAutoAnswer(false);
          }, 3000);
        }else{ 
          _phoneBar.consultationBtnClickUI();
        }
    }
}


function transferCallWaitBtnClickUI() {
  if (typeof _phoneBar !== 'undefined') {
     // 先移回内容再关闭
     var transferContent = $('#consultationModalBody table').detach();
     $('#transfer_area > td').append(transferContent);
     $('#transfer_area').hide();
     ModalUtil.hide('consultationModal');
     
    _phoneBar.transferCallWaitBtnClickUI();
   
  }
}

function conferenceStartBtnUI() {
    if (typeof _phoneBar !== 'undefined') {
        
        if (!jsSipUAInstance.getAutoAnswer()) {
          jsSipUAInstance.setAutoAnswer(true);
          _phoneBar.conferenceStartBtnUI('');
          setTimeout(() => {
              jsSipUAInstance.setAutoAnswer(false);
          }, 3000);
        }else{ 
          _phoneBar.conferenceStartBtnUI('');
        }
    }
}

