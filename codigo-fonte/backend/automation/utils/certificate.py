from selenium.webdriver.firefox.firefox_profile import FirefoxProfile
from selenium import webdriver

profile = FirefoxProfile()

#Importa o certificado
profile.set_preference("security.default_personal_cert", "Select Automatically")

#Forca carregamento do certificado com token PFX
profile.set_preference("security.enterprise_roots.enabled", True)

# Informar o caminho do PFX + senha
profile.set_preference("pkcs11.module.user_cert", "./SILVIA CARLA SANTOS COSTA MAGNO80699901553 digital.pfx")
profile.set_preference("pkcs11.module.user_cert_password", "123456")