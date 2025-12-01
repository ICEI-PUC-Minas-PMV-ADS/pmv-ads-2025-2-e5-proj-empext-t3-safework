from selenium.webdriver import Remote
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import os
import time
import base64

PFX_PATH = "./SILVIA CARLA SANTOS COSTA MAGNO80699901553 digital.pfx"
PFX_PASSWORD = ""

class GovFlow:
    def __enter__(self):

        #verificar pasta de fotos
        os.makedirs("step_flow", exist_ok=True)

        options = Options()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        encoded_pfx = base64.b64encode(open("cert.pfx", "rb").read()).decode()

        options.add_experimental_option("autoSelectCertificateForUrls", [
            {
                "pattern": "https://*.acesso.gov.br",
                "certificate": encoded_pfx,
            }
        ])

        options.add_argument(f"--certificate-store-password={PFX_PASSWORD}")
        options.add_argument(f"--client-certificate-file=cert.pfx")


        self.d = Remote(
            command_executor="http://localhost:4444/wd/hub",
            options=options
        )
        self.wait = WebDriverWait(self.d, 10)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.d.quit()

    #Excecao: Sem acesso ao certificado
    def verificar_certificado(self):
        if(self.wait.until(EC.url_contains("info/x509"))):
            self.d.save_screenshot('step_flow/step1.2_Error.png')
            print("❌ Certificado não carregado ou inválido.")

    #Paso-1: Acessar site do Gov
    def acessar_gov(self):
        self.d.get("https://sso.acesso.gov.br/login")
        self.d.save_screenshot('step_flow/step1.png')
    
    #Passo-1.1: Clicar login com certificado digital
    def login_gov(self):
        btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, "login-certificate"))
        )
        btn.click()
        time.sleep(5)
        self.d.save_screenshot('step_flow/step1.1.png')
        time.sleep(15)
        self.verificar_certificado()
        