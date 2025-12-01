from utils.gov_flow import GovFlow

with GovFlow() as steps:
    steps.acessar_gov()
    steps.login_gov()
